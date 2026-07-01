/**
 * Thin HTTP wrapper over the ZER0ONE Lab REST API.
 * Uses the config's apiKey as bearer.
 */
import { request } from "undici";
import { requireConfig } from "./config.js";
export async function api(path, opts = {}) {
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
                const parsed = JSON.parse(text);
                if (parsed.error)
                    msg += `: ${parsed.error}`;
            }
            catch {
                if (text)
                    msg += `: ${text.slice(0, 200)}`;
            }
            throw new Error(msg);
        }
        if (!text)
            return {};
        return JSON.parse(text);
    }
    finally {
        clearTimeout(timer);
    }
}
/**
 * Unauthenticated call — used by `zer0one login` if we ever add a
 * challenge flow.  For now: just checks base URL reachable.
 */
export async function pingBase(baseUrl) {
    try {
        const res = await request(`${baseUrl}/api/vitals`, { method: "GET" });
        res.body.dump();
        return res.statusCode < 500;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=api.js.map