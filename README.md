# Junos CLI Simulator

A browser-based simulator of the Juniper Junos command line, built for practicing lab commands without needing a VM. It runs entirely in your browser with no backend, no build step and no dependencies.

**Live demo:** https://nrupajaa.github.io/junos-simulator/

## Features

- Operational and configuration modes (`configure`, `exit`, `edit`, `top`, `up`)
- `set` / `delete` commands that build a real candidate configuration
- `commit`, `commit check`, `rollback` and `show | compare`
- `show` commands for interfaces, routes, VLANs, security zones and more
- `ping` and `traceroute`
- Tab completion, `?` help, command history and output pipes (`| match`, `| except`, `| count`)
- 12 built-in practice labs (type `lab` to list them)

## How to run

Download or clone the repo and open `index.html` in your browser. That's it.

Prefer a single file? Open `junos-sim-standalone.html`, which has everything bundled together.

## Project files

| File | Purpose |
|------|---------|
| `index.html` | Page layout |
| `style.css` | Terminal styling |
| `app.js` | Simulator logic |
| `junos-sim-standalone.html` | All-in-one version |

## Limitations

This simulates a single device only, so features that need a second device (such as LACP or RSTP negotiation) show plausible output rather than real results. Commands the simulator doesn't know return a syntax error.
