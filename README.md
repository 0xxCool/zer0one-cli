
# ZER0ONE CLI — Cloud Render Farm Command Line for Blender

**Send Blender renders from your terminal to a GPU cloud, pay per rendered frame, download when done.** ZER0ONE CLI is the command-line interface for [ZER0ONE Lab Cinema Render](https://zer0onelab.com/) — the cloud render farm built by [ZER0ONE Studio](https://zer0one.codes/) in Bogojevo, Serbia.

> No SSH, no Docker, no cluster to babysit. Point at a `.blend`, get a job ID, get a download link.

## Install

```bash
npm install -g @zer0one/lab-cli
zer0one login        # paste your API key from https://app.zer0onelab.com/account/api-keys
```

## Quick start

```bash
# Render frames 1-100 on the cheapest GPU tier (RTX A4000)
zer0one render scene.blend --frames 1-100 --gpu a4000 --output ./out/

# Force a faster tier when the deadline is tighter than the budget
zer0one render scene.blend --frames 1-100 --gpu 4090

# Watch jobs, check balance, pull logs
zer0one ls
zer0one balance
zer0one logs <job-id>
```

## GPU tiers and prices

| Tier | GPU | US$/hour | Typical Blender workload |
|---|---|---|---|
| `a4000` | RTX A4000 (16 GB) | 0.25 | Default — 1080p Cycles under 12 GB VRAM |
| `4090` | RTX 4090 (24 GB) | 1.10 | 4K, character animation, sub-D-heavy meshes |
| `a6000` | RTX A6000 (48 GB) | 1.80 | 8K environments, geo-cache-heavy VFX |
| `h100` | H100 SXM5 (80 GB) | 4.50 | ML pipeline, LLM fine-tuning (rarely needed for Blender) |

The A4000 is our default because it's the [cost-optimum for most Blender jobs](https://zer0one.codes/de/insights/rtx-a4000-cost-optimal-blender-cloud) — 5× cheaper per frame than an H100, only 4.8× slower.

## Features

- **Native Blender 4.2 + Cycles OptiX** — no version dance.
- **Multi-GPU frame-splitting** for Pro-tier accounts: 4 GPUs in parallel = ~4× wall-clock speedup.
- **Automatic texture-pack unpacking** — if the .blend references relative textures, we pull the whole prefix.
- **Deterministic cost estimate before spawn** — job denies itself if the estimate exceeds your budget.
- **HDRI + PolyHaven CC0 asset library** mounted at `/assets/hdri/` on the pod.
- **OptiX AI-Denoise toggle** — cinematic quality with fewer samples.
- **Instant download URLs** via presigned R2 (EU jurisdiction).

## Blender Add-on (optional)

Prefer clicking to typing? The [ZER0ONE Blender Add-on](https://github.com/0xxCool/zer0one-blender-addon) adds a `File → Send to ZER0ONE Lab` menu that uses the same CLI under the hood.

## Documentation

- [Cinema Render Landing](https://zer0onelab.com/)
- [Blender Add-on Repo](https://github.com/0xxCool/zer0one-blender-addon)
- [ZER0ONE Studio (Engineering)](https://zer0one.codes/)
- [Cost-Optimum for Blender Renders — Deep-Dive](https://zer0one.codes/en/insights/rtx-a4000-cost-optimal-blender-cloud)

## About

Built by [Michael Jajagin](https://www.linkedin.com/in/zer0one) at [ZER0ONE](https://zer0one.codes/) — a senior engineering studio and cloud render farm based in Bogojevo, Serbia. The CLI is MIT-licensed. Bugs and feature requests: [open an issue](https://github.com/0xxCool/zer0one-cli/issues).

## License

MIT

