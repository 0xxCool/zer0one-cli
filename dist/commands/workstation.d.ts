/**
 * `zer0one workstation <open|term>` — spawn / open / terminate the
 * caller's Cloud Workstation.
 *
 * `open`  — if no active row, spawn one; then print the branded URL.
 *           NOTE: the branded URL needs a session-scoped token that
 *           lives in the browser's sessionStorage, so the CLI can only
 *           print instructions to open it in the dashboard.  Direct
 *           CLI-to-workstation open lands with a device-code flow later.
 * `term`  — terminate the active workstation.
 */
export declare function workstationOpenCommand(opts: {
    tier: string;
}): Promise<void>;
export declare function workstationTermCommand(): Promise<void>;
