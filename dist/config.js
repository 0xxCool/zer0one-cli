/**
 * Config file at ~/.config/zer0one/cli.json.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
const CONFIG_DIR = process.env.XDG_CONFIG_HOME
    ? join(process.env.XDG_CONFIG_HOME, "zer0one")
    : join(homedir(), ".config", "zer0one");
const CONFIG_PATH = join(CONFIG_DIR, "cli.json");
export const DEFAULT_BASE_URL = process.env.ZER0ONE_BASE_URL ?? "https://app.zer0onelab.com";
export async function readConfig() {
    try {
        const raw = await readFile(CONFIG_PATH, "utf8");
        const parsed = JSON.parse(raw);
        if (!parsed.apiKey)
            return null;
        return {
            apiKey: parsed.apiKey,
            baseUrl: parsed.baseUrl ?? DEFAULT_BASE_URL,
        };
    }
    catch {
        return null;
    }
}
export async function writeConfig(cfg) {
    await mkdir(dirname(CONFIG_PATH), { recursive: true, mode: 0o700 });
    await writeFile(CONFIG_PATH, JSON.stringify(cfg, null, 2), { mode: 0o600 });
}
export function configPath() {
    return CONFIG_PATH;
}
/**
 * Resolve the effective config: env-var override > file > null.  Errors
 * with a helpful message if there's no api key configured.
 */
export async function requireConfig() {
    const cfg = await readConfig();
    if (!cfg) {
        console.error("No API key configured.  Run `zer0one login` first, or create a key at");
        console.error(`  ${DEFAULT_BASE_URL}/de/account`);
        process.exit(2);
    }
    return cfg;
}
//# sourceMappingURL=config.js.map