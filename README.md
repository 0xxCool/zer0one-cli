# zer0one-cli

Command-line interface for **ZER0ONE Lab** — Cinema Render + Cloud Workstation.

Renders your Blender scenes on real NVIDIA GPUs and spawns / manages Cloud
Workstations directly from your terminal.

## Install

```sh
npm install -g zer0one-cli
```

Requires Node.js 20+.

## Quick start

```sh
zer0one login              # paste your API key (create one at
                           # https://app.zer0onelab.com/de/account)
zer0one whoami             # confirm the key is valid

# fire off a render
zer0one render scene.blend \
  --tier a4000 \
  --frames 1-24 \
  --resolution 1920x1080 \
  --wait                   # blocks until done, downloads output

# open a Cloud Workstation
zer0one workstation open
zer0one workstation term
```

## Configuration

CLI config lives at `~/.config/zer0one/cli.json`:

```json
{
  "apiKey": "zo_live_…",
  "baseUrl": "https://app.zer0onelab.com"
}
```

Override the base URL via `ZER0ONE_BASE_URL` env var (useful for
self-hosted deployments or Beta staging).

## Scopes

API keys carry scopes. The CLI needs:
- `render` — for `zer0one render`
- `workstation` — for `zer0one workstation *`
- `read` — for `zer0one whoami` and listing jobs

Create keys with the scopes you actually need — default keys ship with
`render` + `workstation`.

## License

MIT © ZER0ONE Lab
