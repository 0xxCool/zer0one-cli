/**
 * `zer0one whoami` — dump identity + scopes.
 *
 * Uses the render/jobs GET endpoint as a low-side-effect auth probe.
 * Successful call = key is valid, has read/render scope.
 */

import { api } from "../api.js";
import { readConfig } from "../config.js";

export async function whoamiCommand() {
  const cfg = await readConfig();
  if (!cfg) {
    console.error("Not logged in.  Run `zer0one login` first.");
    process.exit(2);
  }
  console.log(`server:  ${cfg.baseUrl}`);
  console.log(`key:     ${cfg.apiKey.slice(0, 12)}…`);
  try {
    // Any auth-required endpoint would do; jobs list is cheap.
    await api<{ ok: boolean; jobs: unknown[] }>("/api/render/jobs");
    console.log("auth:    ✓ valid");
  } catch (e) {
    console.log(`auth:    ✗ ${(e as Error).message}`);
    process.exit(1);
  }
}
