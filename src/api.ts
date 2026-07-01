/**
 * Thin HTTP wrapper over the ZER0ONE Lab REST API.
 * Uses the config's apiKey as bearer.
 */

import { request } from "undici";
import { requireConfig, type CliConfig } from "./config.js";

export type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  timeoutMs?: number;
};

export async function api<T = unknown>(
  path: string,
  opts: ApiOptions = {},
): Promise<T> {
  const cfg = await requireConfig();
  const url = `${cfg.baseUrl}${path}`;
  const method = opts.method ?? "GET";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 60000);
  try {
    const res = await request(url, {
      method,
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    });
    const text = await res.body.text();
    if (res.statusCode >= 400) {
      let msg = `${method} ${path} failed with ${res.statusCode}`;
      try {
        const parsed = JSON.parse(text) as { error?: string };
        if (parsed.error) msg += `: ${parsed.error}`;
      } catch {
        if (text) msg += `: ${text.slice(0, 200)}`;
      }
      throw new Error(msg);
    }
    if (!text) return {} as T;
    return JSON.parse(text) as T;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Unauthenticated call — used by `zer0one login` if we ever add a
 * challenge flow.  For now: just checks base URL reachable.
 */
export async function pingBase(baseUrl: string): Promise<boolean> {
  try {
    const res = await request(`${baseUrl}/api/vitals`, { method: "GET" });
    res.body.dump();
    return res.statusCode < 500;
  } catch {
    return false;
  }
}

// Silence unused-import lint in tsc strict mode when this file is
// bundled without exercising the type.
export type _unused = CliConfig;
