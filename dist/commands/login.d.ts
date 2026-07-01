/**
 * `zer0one login` — prompt for an API key, store it in the config file.
 *
 * MVP: paste-based (no OAuth device flow).  User creates a key on the
 * web dashboard, pastes it here.  Interactive-friendly but scriptable
 * via `--api-key`.
 */
export declare function loginCommand(opts: {
    apiKey?: string;
    baseUrl?: string;
}): Promise<void>;
