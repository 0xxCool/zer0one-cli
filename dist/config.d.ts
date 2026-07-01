/**
 * Config file at ~/.config/zer0one/cli.json.
 */
export type CliConfig = {
    apiKey: string;
    baseUrl: string;
};
export declare const DEFAULT_BASE_URL: string;
export declare function readConfig(): Promise<CliConfig | null>;
export declare function writeConfig(cfg: CliConfig): Promise<void>;
export declare function configPath(): string;
/**
 * Resolve the effective config: env-var override > file > null.  Errors
 * with a helpful message if there's no api key configured.
 */
export declare function requireConfig(): Promise<CliConfig>;
