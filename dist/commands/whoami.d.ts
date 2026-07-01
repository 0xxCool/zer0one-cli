/**
 * `zer0one whoami` — dump identity + scopes.
 *
 * Uses the render/jobs GET endpoint as a low-side-effect auth probe.
 * Successful call = key is valid, has read/render scope.
 */
export declare function whoamiCommand(): Promise<void>;
