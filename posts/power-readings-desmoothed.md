---
title: Recovering real-time battery power readings on Linux 
date: 2025-03-22T20:44:00.000-04:00
description: An exploration into battery power readings on Linux. Showing how on my laptop, the power readings are smoothed and that, by learning the smoothing function, true power readings can be recovered.
---

As part of ongoing efforts to better understand the factors that impact my
laptop's battery life, I've attempted to take detailed power usage readings.
Collecting this data appeared straightforward given there are files
simply labeled "power", but digging deeper revealed some odd inconsistencies.
In this post, I will show how my battery's power readings are actually
smoothed out, how this can give misleading data, and show that it is
possible to invert the smoothing to recover the "true" power readings.

_As a quick disclaimer: I have no idea how the behaviors described here 
generalize. It would not surprise me to learn that this is common
practice, but for now all I can claim is that it applies to my
hardware_.[^1]

To start, we will look at how information from the battery is reported to the
operating system. On Linux, all this is ultimately handled in the kernel, which
reports hardware information via `sysfs`. In particular, we can look at
`/sys/class/power_supply/` which, on my machine, contains the `BAT0/`
subdirectory with a number of relevant files, such as `power_now`,
`energy_now`, and `energy_full`. These files are updated in near real time (on
my machine, it seems to be every ~8 seconds or so), and contain the following:
this:

```bash
cat /sys/class/power_supply/BAT0/energy_now
13930000
cat /sys/class/power_supply/BAT0/energy_full
45850000
cat /sys/class/power_supply/BAT0/power_now  
4721000
```

If you dig into some of the [kernel code](https://web.git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git/tree/include/linux/power_supply.h?h=linux-6.9.y)
documentation, 
you can see that the units for the energy and power are microwatt-hours and
microwatts, respectively. This immediately provides the current battery
percentage (computing `energy_now / energy_full`) and an estimate of
remaining battery life (computing `energy_now / power_now`). 

It's tempting to take this power estimate and assume that it is a valid
measure of real time power usage, but I'll show that this is not necessarily
the case. One behavior you may have observed that could clue you in on this: if
you run a high-resource process, such as a game or heavy computation,
you might notice that the estimated battery life responds more gradually compared
to the sudden change in resource utilization. There is a noticeable lag between
significant changes to power consumption via CPU usage or the like and what
your battery ultimately reports.

I can demonstrate this directly by recording my battery's power readings 
(from `power_now`) under an artificial CPU load where I can precisely
control when the load start and stops. To achieve this, I wrote a script 
that would, for a duration of 30 minutes, record the contents of `power_now` every
8 seconds. For the first 10 minutes, I gathered baseline
power readings under idle conditions. Then, I started 8 simultaneous
processes that generate random numbers in a loop for the following 10 minutes.
This pretty reliably maxes out 8 of my 12 core CPU for the duration. The final
10 minutes of the script collected readings under idle conditions
again.

The graph below shows the readings from that experiment.

<div style="text-align: center;">
  <img src="/post-images/power-readings-desmoothed/obs_chart_combined.svg" alt=
  "Graph of power readings versus time during the experiment. The graph shows a
  jump that smoothly approaches a maximum in the power readings when the
  artificial load is applied." style="display: block; margin: 0 auto"/>
</div>

The primary features that we'd probably expect are there:[^2] around the 10 minute
mark there is a sharp spike in the readings and after 20 minutes
the readings drop back down. Curiously, these changes are not 
immediate. The maximum power reading is approached _smoothly_ rather than
sharply. Similarly for the decay after the load is removed. 

This, to me, seemed at odds with the experimental setup.
My system jumped from idle to ~800% CPU usage in about a second upon applying
the load and similarly dropped quickly down to idle following removal. No gentle
approach. I suspected that there was some sort of averaging going on
beforehand, but the form was not immediately obvious. Visually, this looked 
exponential in nature. I searched around and came across [exponential
smoothing](https://en.wikipedia.org/wiki/Exponential_smoothing), which just
felt right to me.

Briefly, exponential smoothing transforms raw readings 
$x_1, x_2, \dots, x_t$ into smoothed readings $s_1, s_2, \dots, s_t$
via the recursive relationship:

$$
s_t = \alpha x_t + (1 - \alpha) s_{t - 1} \qquad s_0 = x_0
$$

where $\alpha$ is a smoothing parameter. If you expand this
recursive relation, you will see that the influence of any given point
decays exponentially in the presence of further readings. To me, this
seems exactly like the kind of smoothing you would want to implement
at a low-level. It smooths out errant spikes, adjusts relatively 
quickly, and only requires storing one previous value to compute.

It seems plausible, but we can go a step further and see if this kind of
smoothing is actually consistent with the observed readings. To do so, we need
to make some assumptions. First, because it looks like the power readings
settle down to near-constant values in both the idle and load regions, I will
assume that the "true" power readings would takes the form of a step function
where the load is constant in both regions. Taking medians in the regions that
look roughly constant, I came up with the following:

$$
P_{guess} = \begin{cases}
2500 & t \in (0, 600) \cup (1200, 1800)\\
11140 & t \in [600, 1200]\\
\end{cases}
$$

If we overlay this on our observations we get the following:

<div style="text-align: center;">
  <img src="/post-images/power-readings-desmoothed/guess_overlay_combined.svg" alt=
  "Step function overlain over observations" style="display: block; margin: 0 auto"/>
</div>

If we assume that the orange curve represents the "true" power readings,
we can attempt to fit an exponential smoothing model using the orange curve as
$x_t$ and the observed readings as $s_t$. You can fit this model any which way you
want, but I implemented a simple Stan model:

```stan
data {
  int N;
  array[N] real P_guess;
  array[N] real P_obs;
}
parameters {
  real<lower=0, upper=1> alpha;
  real<lower=0> sigma;
}
model {
  alpha ~ beta(1, 10);
  sigma ~ normal(0, 5);
  {
    real S = P_guess[1];
    for (n in 2:N) {
      S = P_guess[n] * alpha + (1 - alpha) * S;
      P_obs[n] ~ normal(S, sigma);
    }
  }
}
```

This assumes a little bit of normally distributed noise in the
observations and places a $\mathrm{Beta}(1, 10)$
prior which constrains $\alpha$ appropriately in $(0, 1)$ but 
favors smaller values.[^3]

The model fits the data without any diagnostic warnings
and all inferences look reasonable. The most important of these
is on the smoothing parameter which has $E[\alpha] = 0.1365$
and a 90% interval of $(0.1347, 0.1383)$, which is to say that the 
inference on this parameter is very tight.

With a given value of $\alpha$, we can take our step function
power profile and run it forward through the smoothing function.
Using the posterior mean as our value of $\alpha$, this gives the following:


<div style="text-align: center;">
  <img src="/post-images/power-readings-desmoothed/guess_smoothed.svg" alt=
  "Graph showing close agreement between the smoothed guess power profile and the observed power profile" style="display: block; margin: 0 auto"/>
</div>

Pretty bang on, if I do say so myself. These values are surprisingly close
given that the power profile we assumed for the guess was extremely simple
and there's undoubtedly going to be some noise.

Useful for my ultimate goal of making accurate power readings, 
we can invert the smoothing function with a little algebra:

$$
x_t = \frac{s_t - (1 - \alpha) s_{t-1}}{\alpha}
$$

This allows us to transform the observed power readings and 
recover what may be the actual "true" power values, which gives:

<div style="text-align: center;">
  <img src="/post-images/power-readings-desmoothed/desmoothed.svg" alt=
  "Graph showing desmoothed power observations that shows an
    approximate step function with noticeable fluctuations and a 
    big power spike when ramping up the load." style="display: block; margin: 0 auto"/>
</div>

To me, this looks realistic. We see that the idealized step function power
profile is mostly recovered with small power fluctuations throughout. The most
noteworthy feature is the very large power spike right when the initial load is
applied, perhaps some sort of initial turbo/ramp up?

I can't know for sure exactly how the power readings are truly
generated,[^4] but I think this analysis shows a pretty compelling argument
that some form of exponential smoothing is applied. 

Another thing to note is that an extremely common use case of power readings is
estimating the time remaining. True readings, with all the various short-term
fluctuations, would lead to similarly fluctuating time estimates. By applying
smoothing to the readings, users are provided more stable and possibly more
accurate remaining time estimates. 

Unfortunately, if you (like me) _are_ trying to get accurate 
real time estimates of power usage, then smoothing like this frustrates
those efforts. The good news is that with the results here, at least on my
laptop, I feel confident that I can recover reasonably accurate readings 
by inverting the empirically observed smoothing function. I have no idea if any of
this generalizes to other batteries, but I'd be very curious if this
is a common practice across particular devices.


[^1]: My particular laptop is a ThinkPad X1 Carbon Gen 7. I replaced
the original battery with an aftermarket CeIxpert 4P71 (as reported
by my battery).
[^2]: The initial decay from $t=0$ is, I assume, 
simply an artifact from higher power usage as I was setting up the
experiment.
[^3]: With the decent number of observations $N = 225$, this prior won't really
matter that much.
[^4]: I have tried to find specifications or documentation on this, but to
not avail.
