# Junos CLI Simulator

A browser-based Juniper Junos command-line simulator for the **25NHOP612 Juniper Network Operating Systems** lab. It reproduces the behaviour of the Junos VM used in VirtualBox — operational and configuration modes, a candidate/committed configuration database, interactive password prompts, commit validation, and operational output derived from whatever you configured.

No backend, no build step, no dependencies. Three files and a browser.

## Run it

**Open it directly.** Double-click `index.html`. Everything works from `file://`.

**In VS Code.** Install the *Live Server* extension, right-click `index.html` → *Open with Live Server*. Gives you auto-reload while you edit `app.js`.

**With Python**, if you prefer a local server:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Deploy it

**GitHub Pages** (free, no account beyond GitHub):

```bash
git init
git add .
git commit -m "Junos CLI simulator"
git branch -M main
git remote add origin https://github.com/<you>/junos-sim.git
git push -u origin main
```

Then in the repo: *Settings → Pages → Source: Deploy from a branch → main / (root) → Save*. The site appears at `https://<you>.github.io/junos-sim/` in a minute or two.

**Netlify / Vercel / Cloudflare Pages:** drag the folder onto their dashboard, or point them at the repo. No build command, publish directory is the repo root.

**Share as one file:** `junos-sim-standalone.html` has the CSS and JS inlined. Email it, put it on a USB stick, open it anywhere — no server needed.

## Files

| File | What's in it |
|---|---|
| `index.html` | Page shell: header, screen, input line, mobile key row |
| `style.css` | Terminal theme |
| `app.js` | The whole simulator |
| `junos-sim-standalone.html` | Single-file build of the same thing |

Inside `app.js`, in order:

| Section | Purpose |
|---|---|
| `SCHEMA` | The configuration hierarchy. Drives validation, `?`, Tab completion and brace rendering |
| `D` | Device state: mode, edit path, candidate and committed trees |
| `walk()` | Validates a `set` line against `SCHEMA` and returns the statement paths it creates |
| `renderCfg()` | Renders the tree in Junos brace format |
| `terseRows()`, `routes4()`, `routes6()` | Derive operational output from the committed config |
| `commitCheck()` | Commit-time validation rules |
| `opCommand()`, `cfgCommand()` | Command dispatch for each mode |
| `LABS` | The 12 course labs |

## What it simulates

- **Modes** — `configure`, `exit`, `top`, `up`, `edit <hierarchy>`, with the `[edit ...]` banner. Leaving with uncommitted changes prompts for confirmation.
- **Configuration database** — `set` / `delete` build a real tree. `show`, `show | display set`, `show | compare`, `rollback`.
- **Passwords** — `set system root-authentication plain-text-password` prompts twice, enforces the length and character-class rules, stores a `$6$…` hash marked `## SECRET-DATA`.
- **Commit** — `commit`, `commit check`, `commit comment "..."`, `commit and-quit`. Catches missing `root-authentication`, security-zone interfaces that don't exist, `ae0` without `chassis aggregated-devices ethernet device-count`, a VLAN `l3-interface` with no matching irb unit, and `family inet` together with `ethernet-switching` on one unit.
- **Operational output** — `show interfaces terse`, `show route`, `show route table inet6.0`, `show configuration`, `show vlans`, `show security zones`, `show firewall filter`, `show lacp statistics`, `show system users`. All computed from the committed configuration.
- **Tests** — `ping` (v4 and v6, `source`, `count`, Ctrl-C), `traceroute`.
- **CLI behaviour** — Tab completion, `?` for completions, Up/Down history, Ctrl-C / Ctrl-L / Ctrl-U, output pipes (`| match`, `| except`, `| count`, `| find`, `| display set`, `| no-more`).
- **Labs** — `lab` lists all 12, `lab 6` prints one, `lab 6 run` loads each command into the prompt so you step through with Enter.
- **Reset** — `request system zeroize` wipes the device.

## Limits

- One device. LACP and RSTP have no peer to negotiate with, so bundle and port states are plausible rather than negotiated, and DHCP shows no client bindings.
- Commands outside the schema return a syntax error. That is intentional, but it means the schema is the boundary of what the simulator accepts.

## Adding a command

**A new configuration statement** — add it to `SCHEMA`. `A()` is a flag (`edge`), `V()` takes one value (`host-name R1`), a plain object is a hierarchy. Validation, `?`, Tab and rendering all follow automatically.

**A new `show` command** — add a branch in `showCommand()` and build its output from `D.comm` so it stays consistent with the configuration.

**A new commit rule** — push `[hierarchy, statement, message]` onto the array in `commitCheck()`.

## Licence

MIT.
