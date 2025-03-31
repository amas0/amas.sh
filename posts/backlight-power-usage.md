---
title: Measuring the impact of screen brightness on laptop battery life
date: 2025-03-30T15:44:00.000-04:00
description: Screen brightness impacts laptop battery life, but how much is unclear. This post describes an experiment to measure the direct effect of screen brightness on battery power draw to infer battery life impact.
---

It is obvious that lowering the brightness of your laptop screen will save
energy. What is _not_ obvious is how much difference it makes. To explore this,
I conducted an experiment to measure battery power draw across different
brightness levels.

My primary focus was the direct effect of screen brightness as an independent
variable on power draw. Standard LCD displays, such as the one in my 7th
generation ThinkPad X1 Carbon, maintain a uniform brightness regardless of the
on-screen content.[^1] 

My experimental setup was simple. I wrote a [Python
script](#experiment-code) that randomly adjusted the brightness of my display,
collected power readings every 10 seconds for 120 seconds, and then repeated
the process with a new randomly selected brightness. My experiment ran across
50 total brightness levels. Crucially, the power readings collected are
de-smoothed according to a process I describe in [another
post](/power-readings-desmoothed). To minimize noise, the script ran on my
laptop in a TTY while idle.

Power readings throughout the experiment are shown in the graph below, with
brightness levels overlaid. The power usage moves along with the changing
brightness. Spikes in power usage are common, so we must be careful to
appropriately account for noise in the analysis.

<div style="text-align: center;">
  <img src="/post-images/backlight-power-usage/raw_obs_with_brightness.svg" alt=
  "Graph of power readings versus time during the experiment with brightness
    overlaid. Visually, one can see power usage moving along with the set
    brightness." style="display: block; margin: 0 auto"/>
</div>

The relationship between brightness and power is clearer when plotted against
each other:

<div style="text-align: center;">
  <img src="/post-images/backlight-power-usage/power_vs_brightness.svg" alt=
  "Graph of power readings versus brightness showing a strong linear trend."
    style="display: block; margin: 0 auto"/>
</div>

The plot shows a pretty compelling linear relationship. I suspect that the
observations that lie outside the tight linear region correspond to the spikes
seen in the power readings. To quantify this relationship, we need to fit a
model to it. I propose the following structure:

$$
P = \alpha + \delta I_{on} + \beta B + \epsilon
$$

Where $P$ and $B$ are power and brightness, respectively. $I_{on}$ is an
indicator that is 1 if the backlight is on and 0 if off (at 0% brightness,
the backlight turns off entirely). The parameters can then be interpreted as
follows: $\alpha$ is the baseline idle power draw of the system absent the
display, $\beta$ is the linear scaling between brightness and power, and
$\delta$ is any additional power cost for turning on the backlight that is not
accounted for by the brightness. $\epsilon$ is a noise term.

The primary parameter I am interested in is $\beta$. If this model
appropriately fits the data, $\beta$ will tell us how much changing screen
brightness affects power usage.

Setting the noise term here requires a bit of thought. To my eye, it looks like
the spread about the linear trend has two distinct scales: a smaller, mostly
symmetric noise that tightly follows the trend and a larger, more skewed noise
term that is likely associated with the power spikes we see in the raw
observations. A generative model that captures this behavior would probably
best do so in a time-dependent manner -- in the graph of power readings against
time, it looks like the gaps between spikes are semi-regular, suggesting some
kind of time-dependent behavior. That being said, modeling the noise process 
accurately is mostly incidental to my inference goals. As long as I can
capture the location of the linear trend reasonably well, then it should be
fine.

With that in mind, a Student's t noise model should be able to withstand 
the idiosyncracies of this data and hopefully capture the main trend.
The Bayesian model that I am going to fit here is then:

$$
\begin{align*}
P | \alpha, \delta, \beta, I_{on}, B, \nu, \sigma &\sim \mathrm{StudentT}(\nu, \alpha + \delta I_{on} + \beta B, \sigma)\\
\alpha &\sim \mathrm{normal}(2, 1)\\
\delta &\sim \mathrm{normal}(0, 1)\\
\beta &\sim \mathrm{normal}(1, 1)\\
\sigma &\sim \mathrm{normal}^+(0, 1)\\
\nu &\sim \mathrm{normal}^+(0, 3)\\
\end{align*}
$$

I rescaled the power readings to watts, so as to put the observations on 
approximately unit scale as well as rescaled the brightness percentage
to $[0, 1]$. The above priors are relatively wide and should contain
the likely regions of interest. The Stan code for this model is as follows:

```stan
data {
  int N;
  vector[N] B;
  vector[N] P;
}
transformed data {
  vector<lower=0, upper=1>[N] isOn;
  for (n in 1:N) {
    if (B[n] > 0.001) {
      isOn[n] = 1;
    }
    else {
      isOn[n] = 0;
    }
  }
}
parameters {
  real alpha;
  real delta;
  real beta;
  real<lower=0> nu;
  real<lower=0> sigma;
}
model {
  alpha ~ normal(2, 1);
  delta ~ normal(0, 1);
  beta ~ normal(1, 1);
  sigma ~ normal(0, 1);
  nu ~ normal(0, 3);

  P ~ student_t(nu, alpha + delta*isOn + beta*B, sigma);
}
```

This model fits smoothly against the experimental data with no diagnostic
warnings. A posterior summary of the parameters is:

| Parameter | Mean | 5% | 50% | 95% |
| --------- | ---- | -- | --- | --- |
| $\alpha$  | 1.80 | 1.76 | 1.80 | 1.84 |
| $\delta$  | 0.11 | 0.06 | 0.11 | 0.15 |
| $\beta$  | 2.21 | 2.19 | 2.21 | 2.23 |
| $\nu$[^2]  | 0.90 | 0.80 | 0.90 | 1.01 |
| $\sigma$  | 0.07 | 0.06 | 0.07 | 0.08 |

The inferences on these parameters are quite precise. Using the posterior mean,
we can plot the fitted linear trend:


<div style="text-align: center;">
  <img src="/post-images/backlight-power-usage/posterior_loc_linear_trend.svg" alt=
  "Linear trend fit from the model overlaid on the observations, showing a strong
    fit."
    style="display: block; margin: 0 auto"/>
</div>

Based on the posterior diagnostics and visual trend here, this model
appropriately captures the main assocation between power and brightness.
Interpreting the parameters, we can infer from $\alpha$ that the idle power
usage of my laptop during the experiment sans display is about 1.8 W. The
$\delta$ parameter is consistent with a small postive value, so the backlight
requires an additional 60 - 150 mW to turn on. The main parameter of interest
$\beta$ is very tightly inferred, implying that the backlight at full
brightness uses 2.21 W, or equivalently, that **increasing the brightness by one
percentage point requires an additional 22.1 mW**.

A more practical interpretation of this result is to reframe it in terms of
battery life with some ballpark numbers. If we assume some baseline power usage
$P_{base}$, a battery capacity $E$, and the power cost of raising the 
brightness by one percent of $P_{backlight}$, then change in battery life
is:

$$
\Delta t = \frac{E}{P_{base} + P_{backlight}} - \frac{E}{P_{base}}
$$

From `/sys/class/power_supply/BAT0/energy_full`, my battery reports that its
full capacity is 45850 milliwatt-hours. In normal light usage, my power draw is
somewhere around 5 watts, so we can plug in $E=45.85$, $P_{base} = 5$, and
$P_{backlight} = 0.022$ into to the above. This gives $\Delta t = -0.04$ hours,
or about 2 minutes and 25 seconds per percentage point. An easier to remember
rule of thumb is that **increasing (reducing) the brightness by 4%
reduces (increases) my total battery life by about 10 minutes.**

The effect here is, of course, highly dependent on the baseline power usage of
my laptop. The greater share of power draw from non-screen components, the less
screen brightness matters. I cannot generalize to other devices, but some rules
of thumb that one could glean is that the more _efficient_ the device, such as 
modern ARM-based machines,[^3] the more important screen brightness becomes in
determining battery life. Although, I suppose some of those devices may also
have more efficient screens (I am personally interested in how this experiment
would turn out on machines with OLED screens). Alternatively, on a beefy gaming
laptop the screen may make up a relatively small fraction of the overall power
draw, so changing up the brightness would give little actual benefit.


## Experiment code

Below is the code used to run the experiment. The `batt` library is a utility
library that I use to more conveniently access low-level battery data on my
laptop. Source for the `batt.psu` file can be found
[here](https://github.com/amas0/batt/blob/d3b347acf65a69f33bea92089f707bf88ef2c147/batt/psu.py).

```python
import json
import random
import subprocess
import time
from dataclasses import asdict, dataclass

import batt.psu as psu


@dataclass
class Measurement:
  true_power_now_mw: float
  brightness_percentage: float
  seconds_elapsed: float


class Brightness:
  def __init__(self):
    self.current = None
    self.max = None
    self.update()

  def update(self):
    self.current = self.get_current()
    self.max = self.get_max()

  @staticmethod
  def get_max() -> int:
    cmd = ["brightnessctl", "max"]
    res = subprocess.run(cmd, capture_output=True)
    return int(res.stdout.strip())

  @staticmethod
  def get_current() -> int:
    cmd = ["brightnessctl", "get"]
    res = subprocess.run(cmd, capture_output=True)
    return int(res.stdout.strip())

  @property
  def percentage(self) -> float:
    assert self.current is not None
    assert self.max is not None
    return self.current / self.max

  @percentage.setter
  def percentage(self, val: float):
    cmd = ["brightnessctl", "set", f"{int(val)}%"]
    subprocess.run(cmd, capture_output=True)
    self.update()


def power_reading() -> int:
  return psu.get_current_battery_info().power_now


def set_brightness_and_run_collection(
  brightness_perc: float,
  total_seconds: int,
  measurement_interval_seconds: int
) -> list[Measurement]:
  b = Brightness()
  measurements = []
  b.percentage = brightness_perc
  start_time = time.time()
  prev = None
  while time.time() - start_time < total_seconds:
    curr = power_reading()
    # Wait until second reading to get de-smoothed power reading
    if prev is not None:       
      true_power = psu.desmooth_power_reading(curr, prev)
      measurements.append(
        Measurement(
          true_power_now_mw=true_power,
          brightness_percentage=brightness_perc,
          seconds_elapsed=time.time() - start_time,
        )
      )
    prev = curr
    time.sleep(measurement_interval_seconds)
  return measurements


def save_measurement_results(measurements: list[Measurement], fname: str):
  measurement_dicts = [asdict(measurement) for measurement in measurements]
  with open(fname, "w") as f:
    json.dump(measurement_dicts, f)


def run_randomized_experiments(
  num_levels_to_measure: int,
  seconds_per_level: int,
  measurement_interval: int
) -> list[Measurement]:
  measurements = []
  brightness_levels = list(range(101))
  bls_to_measure = random.sample(brightness_levels, num_levels_to_measure)
  for i, bl in enumerate(bls_to_measure, start=1):
    print(f"Measuring brightness level {bl}% - ({i}/{num_levels_to_measure})")
    meas = set_brightness_and_run_collection(
      bl, seconds_per_level, measurement_interval
    )
    measurements += meas

  return measurements


if __name__ == "__main__":
  meas = run_randomized_experiments(50, 121, 10)
  save_measurement_results(meas, "measurements_true_power.json")
```



[^1]: In contrast to more advanced modern display technologies that include
    multiple dimming zones, where the backlight dynamically adjusts to the
image on the screen to enhance contrast. OLED displays are an extreme version
of this where each pixel emits light independently and true blacks can be
achieved by turning off the pixel entirely.

[^2]: Of note with the inferred value of the $\nu$ parameter is that the mean
    of a Student's $t$ distribution only exists if $\nu > 1$. My data is most
compatible with values below this, indicating the Student's $t$ model needs
very significant tails to manage the noise. This is a good argument against Student's
$t$ as a valid model for this data in the generative sense. I do not think that
this invalidates any of my inferences about the main trend, but it does not
adequately capture the behavior of the noise generation proecess. In fact, if
we try to perform some posterior predictive checks against our observed data,
the generated data has far too wide of a spread (to include some impossible
values). If we _were_ interested in more carefully modeling the full data
generating process, we would need to explore alternative models.

[^3]: Which I do not have.
