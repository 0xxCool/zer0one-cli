/**
 * `zer0one login` — prompt for an API key, store it in the config file.
 *
 * MVP: paste-based (no OAuth device flow).  User creates a key on the
 * web dashboard, pastes it here.  Interactive-friendly but scriptable
 * via `--api-key`.
 */

import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { DEFAULT_BASE_URL, writeConfig } from "../config.js";
import { pingBase } from "../api.js";

export async function loginCommand(opts: { apiKey?: string; baseUrl?: string }) {
  let apiKey = opts.apiKey?.trim() ?? "";
  const baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).trim();

  if (!apiKey) {
    const rl = createInterface({ input: stdin, output: stdout });
    console.log(`Create a key at ${baseUrl}/de/account → API-Keys section`);
    apiKey = (await rl.question("Paste your zo_live_… API key: ")).trim();
    rl.close();
  }
  if (!apiKey.startsWith("zo_live_")) {
    console.error("That does not look like a valid API key (expected zo_live_…).");
    process.exit(2);
  }
  const reachable = await pingBase(baseUrl);
  if (!reachable) {
    console.warn(`⚠ Warning: ${baseUrl} did not respond — saving anyway.`);
  }
  await writeConfig({ apiKey, baseUrl });
  console.log("✓ API key saved.");
  console.log("  Run `zer0one whoami` to verify.");
}
