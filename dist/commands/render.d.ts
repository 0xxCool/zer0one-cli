/**
 * `zer0one render <path>` — upload a .blend and start a Cinema Render job.
 *
 * Flow (v0.2):
 *   1. Read the local .blend header — verify magic number
 *   2. POST /api/render/jobs {…}                       → draft job + estimate
 *   3. POST /api/render/jobs/<id>/presign-upload       → presigned R2 PUT URL
 *   4. PUT the file directly to R2 (single-shot, ≤5 GB)
 *   5. POST /api/render/jobs/<id>/submit                → state='queued'
 *   6. If --wait: poll /api/render/jobs (until job.state in terminal set),
 *      then TODO: download outputs (0.3).
 */
export type RenderArgs = {
    path: string;
    tier: string;
    frames: string;
    resolution: string;
    engine: string;
    samples: string;
    outputFormat: string;
    maxBudget: string;
    wait: boolean;
};
export declare function renderCommand(args: RenderArgs): Promise<void>;
