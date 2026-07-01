#!/usr/bin/env node
/**
 * zer0one-cli entry point.
 *
 * Commands:
 *   zer0one login [--api-key ...] [--base-url ...]
 *   zer0one whoami
 *   zer0one render <path> [--tier ...] [--frames N-M] ...
 *   zer0one workstation open [--tier ...]
 *   zer0one workstation term
 */

import { Command } from "commander";
import { loginCommand } from "./commands/login.js";
import { whoamiCommand } from "./commands/whoami.js";
import { renderCommand } from "./commands/render.js";
import {
  workstationOpenCommand,
  workstationTermCommand,
} from "./commands/workstation.js";

const program = new Command();

program
  .name("zer0one")
  .description("ZER0ONE Lab — Cinema Render + Cloud Workstation from your terminal")
  .version("0.2.0");

program
  .command("login")
  .description("save an API key so the CLI can auth")
  .option("--api-key <key>", "paste key non-interactively")
  .option("--base-url <url>", "override server base URL")
  .action(loginCommand);

program
  .command("whoami")
  .description("check the current API key is valid")
  .action(whoamiCommand);

program
  .command("render <path>")
  .description("start a Cinema Render job from a local .blend")
  .option("--tier <tier>", "GPU tier: a4000 | 4090 | a6000 | h100", "a4000")
  .option("--frames <range>", "frame range N-M", "1-1")
  .option("--resolution <WxH>", "resolution, e.g. 1920x1080", "1920x1080")
  .option("--engine <engine>", "cycles | eevee", "cycles")
  .option("--samples <n>", "Cycles samples / EEVEE samples", "128")
  .option("--output-format <fmt>", "png | exr | jpg | mp4_h264", "png")
  .option("--max-budget <usd>", "hard cost cap in USD", "5")
  .option("--wait", "block until finish + download output", false)
  .action((path, opts) => renderCommand({ path, ...opts }));

const ws = program.command("workstation").description("Cloud Workstation lifecycle");
ws.command("open")
  .description("spawn or open the caller's workstation")
  .option("--tier <tier>", "GPU tier for a fresh spawn", "a4000")
  .action(workstationOpenCommand);
ws.command("term")
  .description("terminate the caller's workstation")
  .action(workstationTermCommand);

program.parseAsync(process.argv).catch((e) => {
  console.error((e as Error).message);
  process.exit(1);
});
