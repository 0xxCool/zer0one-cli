/**
 * Thin HTTP wrapper over the ZER0ONE Lab REST API.
 * Uses the config's apiKey as bearer.
 */
import { type CliConfig } from "./config.js";
export type ApiOptions = {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
    timeoutMs?: number;
};
export declare function api<T = unknown>(path: string, opts?: ApiOptions): Promise<T>;
/**
 * Unauthenticated call — used by `zer0one login` if we ever add a
 * challenge flow.  For now: just checks base URL reachable.
 */
export declare function pingBase(baseUrl: string): Promise<boolean>;
export type _unused = CliConfig;
