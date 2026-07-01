/**
 * `zer0one render <path>` — upload a .blend and start a Cinema Render job.
 *
 * Flow:
 *   1. Read the local .blend
 *   2. POST /api/render/jobs {..., state: 'draft'}         → job row + presigned upload URL
 *   3. PUT the .blend to R2 (multipart or single-shot ≤5 GB)
 *   4. POST /api/render/jobs/<id>/submit                    → state='queued'
 *   5. If --wait: poll /api/render/jobs/<id> until terminal,
 *      then download outputs.
 *
 * MVP: we skip the presigned-upload step because the plain jobs POST
 * currently returns a draft row without a signed URL — the CLI can't
 * complete an end-to-end submit yet.  We fail loudly with instructions.
 * Full submit lands with the file-upload API in the CLI's 0.2 release.
 */

import { readFile, stat } from "node:fs/promises";
import { basename } from "node:path";
import { api } from "../api.js";

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

function parseFrameRange(s: string): [number, number] {
  const m = /^(\d+)-(\d+)$/.exec(s);
  if (!m) throw new Error(`--frames must be N-M (got ${s})`);
  const a = parseInt(m[1], 10);
  const b = parseInt(m[2], 10);
  if (a < 1 || b < a) throw new Error("invalid frame range");
  return [a, b];
}

export async function renderCommand(args: RenderArgs) {
  const p = args.path;
  const st = await stat(p).catch(() => null);
  if (!st || !st.isFile()) {
    console.error(`File not found: ${p}`);
    process.exit(2);
  }
  const [frameStart, frameEnd] = parseFrameRange(args.frames);
  const body = {
    gpuTier: args.tier,
    frameStart,
    frameEnd,
    resolution: args.resolution,
    engine: args.engine,
    samples: parseInt(args.samples, 10),
    outputFormat: args.outputFormat,
    maxBudgetCents: Math.round(parseFloat(args.maxBudget) * 100),
  };

  const draft = await api<{
    ok: boolean;
    job: { id: string; state: string };
    estimate: { estimatedSeconds: number; estimatedCents: number };
  }>("/api/render/jobs", { method: "POST", body });

  console.log(`✓ draft job created: ${draft.job.id}`);
  console.log(
    `  estimate: ~${draft.estimate.estimatedSeconds}s, ~$${(draft.estimate.estimatedCents / 100).toFixed(2)}`,
  );

  // Sniff the .blend so a future upload step can validate.  For MVP,
  // read at least the header so we fail fast on non-.blend inputs.
  const head = await readFile(p, { encoding: null }).then((b) => b.subarray(0, 12));
  if (head.subarray(0, 7).toString() !== "BLENDER") {
    console.warn(
      `⚠ ${basename(p)} does not start with a BLENDER magic number — server upload may reject.`,
    );
  }

  console.log(
    "\nUpload flow (multipart R2 PUT) lands in CLI 0.2 — for now, complete the submit on the",
  );
  console.log("web dashboard:");
  console.log("  https://app.zer0onelab.com/de/renders/new");

  if (args.wait) {
    console.log("\n(would poll here in 0.2)");
  }
}
