---
title: Remotely waking a "SteamOS" gaming PC with a Bluetooth controller
date: 2025-06-01T12:00:00.000-04:00
description: In this post, I show how I made it possible to remotely power on my living room Linux gaming PC from a Bluetooth controller. While technical, this elevates my "SteamOS" couch gaming to the full ergonomics of the console experience.
---

I have long pursued the perfect couch PC gaming experience. Despite the
strengths of high-powered hardware and a large game catalog, couch PC gaming
has _always_ struggled with ergonomics. Clunkily pulling out a mouse or
keyboard to navigate an interface or dealing with turning on/off the system 
just misses the mark. The simple console experience of sitting down, turning
on the TV, turning on your controller, and playing games is simply superior.

The situation is hardly static. Since the launch of the Steam Deck,
attempts to recreate the console experience improved drastically. Through
projects like [Bazzite](https://bazzite.gg/) or equivalent "SteamOS"-like
setups,[^1] running a Steam Deck-esque experience on your own hardware is both
possible and improves greatly upon similar Windows-based systems.[^2] With this
setup, one gets an almost ideal console-like experience _once your system is
on_.

It is this question that I want to focus on: **how does one ergonomically turn
on a couch gaming PC?**
On one hand, it's a minor issue. Just get up and push the button. Takes four
seconds. On the other hand, it shouldn't have to be this way. 

For a long time, my solution was
[Wake-on-LAN](https://en.wikipedia.org/wiki/Wake-on-LAN). It is widely
available on consumer hardware and only requires an Ethernet connection to the 
system.[^3] This approach allowed me to remotely wake my gaming PC as long as I
had my phone or laptop nearby. Ergonomically way better than getting up off the
couch, but still ultimately unsatisfying. The ideal setup should not require
another device on hand.

With this in mind, I set out to find a better solution.

## The general idea

I had a clear idea of what the ideal solution looked like: I wanted 
to sit down, turn on my controller,[^4] and have my gaming PC wake up.  While
Bluetooth adapters that allow devices to wake the host machine _do exist_, it
seems support is generally limited (and the Bluetooth adapter I already had did
not support this).[^5]

Thinking this through, I realized I didn't need anything _new_ to make this
work. My existing Wake-on-LAN solution gives me the ability to turn on the
system remotely from anywhere in my network, I just needed a way to link my
controller turning on to executing a Wake-on-LAN command. All that was needed was
something always listening to nearby Bluetooth devices. Fortunately, I had an
always-on Linux server nearby with a Bluetooth adapter that fit the bill.[^6]

The shape of my solution was clear: use a server that can listen to Bluetooth
traffic to trigger a Wake-on-LAN to my gaming system.

## Running commands based on nearby Bluetooth devices

I did not immediately find a satisfying solution to the
listen-to-Bluetooth-and-act problem, but having some experience working with
Bluetooth on Linux, it seemed reasonably hackable. I ended up building a small
command line utility, [btdtriggers](https://github.com/amas0/btdtrigger), that
uses the scan capabilities of `bluetoothctl` to see nearby devices advertising
and take actions based on them.

To give an idea of what this looks like, this is what happens when
I run the scan interactively from `bluetoothctl` in my terminal:

```bash
amas ~ $ bluetoothctl
hci0 new_settings: powered bondable ssp br/edr le secure-conn wide-band-speech 
Agent registered
[CHG] Controller 50:E0:85:75:7B:8B Pairable: yes
[bluetoothctl]> scan on
SetDiscoveryFilter success
Discovery started
[CHG] Controller 50:E0:85:75:7B:8B Discovering: yes
[NEW] Device 58:C5:2E:2A:67:E7 LE-White Bose Color II Sou
[NEW] Device 38:B8:00:7B:FB:3B Living Room TV 2
[NEW] Device 28:68:0D:73:82:CE 28-68-0D-73-82-CE
[NEW] Device 15:7D:D0:8A:71:29 15-7D-D0-8A-71-29
[NEW] Device 6D:ED:E5:1D:5D:E5 6D-ED-E5-1D-5D-E5
```

Nearby devices that are newly seen as advertising will show up as `NEW` and
have their associated MAC address and name. The `btdtriggers` utility
more or less just parses the output of this scan and allows one
to define "triggers", which are a set of conditions on the seen devices
and actions to be taken if those conditions are met.

Using `btdtrigger`, the following command defines a trigger that will
send a Wake-on-LAN to my gaming system if either of my two controllers
(identified by their MAC addresses) are newly seen:

```bash
btdtrigger run-trigger \ 
  --address '3C:FA:06:18:79:9E|0C:35:26:C1:8E:FC' \
  --status 'NEW' \
  --command 'wol CC:28:AA:45:B0:BC'
```

More details and info on how to use the `btdtrigger` utility can be
found on the [Github page](https://github.com/amas0/btdtrigger).

The good news is that this does exactly what it says it does. When I power on
my controller, the server sees it and remotely powers on my gaming PC. The
bad news is that this happens whenever my controller is newly seen to be
scanning for a connection. The reason this is bad is that whenever I turn off or
sleep my gaming system, such as after I am done playing, my controller
immediately starts scanning again. This results in the freshly slept gaming PC
being immediately woken back up. 

I have more or less traded the problem of easily turning on my system for the
problem of easily turning it off.

## Incorporating recent power states into wake logic

This new problem means that I cannot naively send a `wol` every
time I a controller starts scanning for a connection. The correct
behavior instead is to account for how recently the gaming system went
to sleep or powered off and prevent any wake commands from being sent
too soon.

My relatively crude approach to solve this was to stand up a basic
API on my server that will keep track of how recently the gaming
PC has been put to sleep and conditionally run wake commands 
if some time threshold has passed. As a basic Python FastAPI app,
this looks like:

```python
import shlex
import subprocess
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI

app = FastAPI()

MOST_RECENT_SLEEP_FILE = Path(__file__).parent / "most_recent_sleep.txt"
WAKE_COMMAND = "wol cc:28:aa:45:b0:bc"


def get_most_recent_sleep() -> datetime | None:
    if not MOST_RECENT_SLEEP_FILE.exists():
        return None
    with open(MOST_RECENT_SLEEP_FILE) as f:
        try:
            dt = datetime.fromisoformat(f.read().strip())
            return dt
        except (ValueError, TypeError):
            return None


def set_most_recent_sleep(dt: datetime):
    with open(MOST_RECENT_SLEEP_FILE, "w") as f:
        f.write(dt.isoformat())


@app.get("/wake")
def wake():
    """Wakes the gaming pc unless it went to sleep/powered off 
    within the last 30 seconds"""

    def send_wake():
        subprocess.run(shlex.split(WAKE_COMMAND))

    if (most_recent_sleep := get_most_recent_sleep()) is None:
        send_wake()
    else:
        diff = datetime.now() - most_recent_sleep
        if diff.total_seconds() > 30:
            send_wake()


@app.post("/update-sleep")
def update_sleep():
    set_most_recent_sleep(datetime.now())
```

This control logic should solve the power-on-loop issue, but requires a few
updates to my setup. First, I need to persist the above API on my server.
Second, instead of having the `btdtrigger` command run the `wol` command
directly, I have it `curl` the `/wake` endpoint of this API. Third, we need
some way to have the gaming system `POST` to the `/update-sleep` endpoint
whenever it sleeps/powers off.

Managing all these behaviors can be done fairly neatly with `systemd` services
across both systems.

## Systemd services for everything

Here I'll show the service definitions that glue everything together
appropriately. To start, the two services that run on my server are the 
Python API to track power states and run the wake command. I have this
living in a `main.py` within a project directory on my user. The corresponding
service file is:

```service
[Unit]
Description=Basic API to remotely wake gaming pc while keeping track of recent sleep events
After=network.target

[Service]
Type=simple
User=amas
WorkingDirectory=/home/amas/projects/controller-power-on
ExecStart=/usr/bin/uv run uvicorn main:app --host 0.0.0.0 --port 8000
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

I use `uv` to manage the project dependencies, so that's how I run the
`uvicorn` web server hosting the FastAPI app. I set the host as `0.0.0.0` so
it accepts requests from other systems (such as the gaming PC).

Next, this is the service file used to listen to the Bluetooth events
using `btdtrigger`:

```service
[Unit]
Description=Listens for Bluetooth controllers to turn on to trigger a remote wake of the livingroom pc
After=network.target

[Service]
Type=simple
User=amas
WorkingDirectory=/home/amas
ExecStart=/usr/bin/uv tool run btdtrigger run-trigger --address '3C:FA:06:18:79:9E|0C:35:26:C1:8E:FC' --status 'NEW' --command 'curl -s localhost:8000/wake'
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

You can see that the triggered command is a `curl` to the web app running on the
same system, which routes the waking logic through the API.

The last component is a mechanism to update the sleep time tracked by the API.
This is also done with a systemd service. Importantly, this one is running
on the gaming PC itself:

```service
[Unit]
Description=Ping server on shutdown or suspend to update timestamp
DefaultDependencies=no
Before=poweroff.target shutdown.target suspend.target hibernate.target hybrid-sleep.target

[Service]
Type=oneshot
ExecStart=/usr/bin/curl -s -XPOST 10.0.0.22:8000/update-sleep
RemainAfterExit=no

[Install]
WantedBy=poweroff.target halt.target reboot.target suspend.target hibernate.target hybrid-sleep.target
```

From this, we get a POST request sent over to the server that updates the 
recent sleep/power off timestamp whenever the system is powered off/slept normally.

With all three of these services enabled, we have the appropriate inter-system
communication to correctly manage the remotely power on behavior.

## It works!

I imagine for most, this solution is impractical. It requires having an extra
Linux system that can always be on listening to Bluetooth devices. It also 
requires being able to set up Wake-on-LAN, set up multiple systemd services, 
and create a local API service to manage the correct state logic, Python 
familiarity, etc. 

But for me, _it just works_. At this point, I feel I have reached the endgame
of the couch PC gaming experience based on the technology that is available
today.[^7]

I anticipate that in near future, an expanded official SteamOS release or 
continued iteration by the Bazzite folks will make some of this stuff a
lot more reasonable, but it all feels within reach. It is an exciting
time for Linux-based gaming in general and the couch PC gaming experience is
the best it has ever been.




[^1]: I effectively have the same setup but done manually. My living room
gaming PC runs Arch Linux and boots directly into a gamescope session
running the Steam Deck UI. This setup pre-dates Bazzite, but has worked great,
so I probably won't change until the official SteamOS release matures a
bit.

[^2]: Of course, the anti-cheat issue remains a real annoyance for certain games.

[^3]: More rarely, some hardware supports Wake-on-LAN over Wi-Fi. I have
implemented a workaround for this on another Wi-Fi only PC, where I use a
Raspberry Pi connected to the PC via Ethernet that is always powered on from the
PC's USB port, allowing one to perform a kind of Wake-on-LAN-over-SSH setup. 

[^4]: The controllers I use are Bluetooth-enabled Xbox controllers (but the
    solution should ideally not be specific to this).

[^5]: Notably, the Steam Deck itself does support this. A boon to its docked
capabilities.

[^6]: This would be easily done with something like a Raspberry Pi.

[^7]: Okay, there's always more to improve. Good integration with something
like Discord so you can hop in a voice call without leaving a game or needing
a keyboard/mouse would be a major upgrade as well.
