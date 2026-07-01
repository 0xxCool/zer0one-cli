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

import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { basename } from "node:path";
import { request } from "undici";
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

const TERMINAL_STATES = new Set(["done", "failed", "cancelled", "budget_exceeded"]);

function parseFrameRange(s: string): [number, number] {
  const m = /^(\d+)-(\d+)$/.exec(s);
  if (!m) throw new Error(`--frames must be N-M (got ${s})`);
  const a = parseInt(m[1], 10);
  const b = parseInt(m[2], 10);
  if (a < 1 || b < a) throw new Error("invalid frame range");
  return [a, b];
}

async function uploadViaPresigned(url: string, filePath: string, size: number): Promise<void> {
  const stream = createReadStream(filePath);
  const res = await request(url, {
    method: "PUT",
    body: stream,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(size),
    },
  });
  const text = await res.body.text();
  if (res.statusCode >= 300) {
    throw new Error(`R2 PUT ${res.statusCode}: ${text.slice(0, 200)}`);
  }
}

export async function renderCommand(args: RenderArgs) {
  const p = args.path;
  const st = await stat(p).catch(() => null);
  if (!st || !st.isFile()) {
    console.error(`File not found: ${p}`);
    process.exit(2);
  }
  const filename = basename(p);
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

  // 1. Validate .blend header
  const head = await readFile(p, { encoding: null }).then((b) => b.subarray(0, 12));
  if (head.subarray(0, 7).toString() !== "BLENDER" && !filename.endsWith(".zip") && !filename.endsWith(".tar.gz")) {
    console.warn(
      `⚠ ${filename} does not start with a BLENDER magic number — server may reject.`,
    );
  }

  // 2. Draft job
  const draft = await api<{
    ok: boolean;
    job: { id: string; state: string };
    estimate: { estimatedSeconds: number; estimatedCents: number };
  }>("/api/render/jobs", { method: "POST", body });

  const jobId = draft.job.id;
  console.log(`✓ draft job created: ${jobId}`);
  console.log(
    `  estimate: ~${draft.estimate.estimatedSeconds}s, ~$${(draft.estimate.estimatedCents / 100).toFixed(2)}`,
  );

  // 3. Get presigned upload URL
  const pres = await api<{ ok: boolean; uploadUrl: string; key: string }>(
    `/api/render/jobs/${jobId}/presign-upload`,
    { method: "POST", body: { filename } },
  );
  console.log(`✓ presigned upload URL (${(st.size / 1024 / 1024).toFixed(2)} MB)`);

  // 4. Direct PUT to R2
  process.stdout.write("  uploading… ");
  await uploadViaPresigned(pres.uploadUrl, p, st.size);
  console.log("done");

  // 5. Submit
  await api(`/api/render/jobs/${jobId}/submit`, { method: "POST", body: {} });
  console.log("✓ submitted — state=queued");

  if (!args.wait) {
    console.log(`\nWatch progress at https://app.zer0onelab.com/de/renders/${jobId}`);
    return;
  }

  // 6. Poll until terminal
  console.log("\nPolling job state (Ctrl+C to detach)…");
  const start = Date.now();
  let prev = "queued";
  for (;;) {
    const list = await api<{ ok: boolean; jobs: Array<{ id: string; state: string; framesDone?: number; frameStart: number; frameEnd: number }> }>(
      `/api/render/jobs`,
    );
    const j = list.jobs.find((x) => x.id === jobId);
    if (!j) {
      console.error("job disappeared?");
      process.exit(1);
    }
    const elapsed = Math.floor((Date.now() - start) / 1000);
    const done = j.framesDone ?? 0;
    const total = j.frameEnd - j.frameStart + 1;
    if (j.state !== prev) {
      console.log(`  [t=${elapsed}s] state=${j.state} frames=${done}/${total}`);
      prev = j.state;
    } else if (elapsed % 30 === 0) {
      console.log(`  [t=${elapsed}s] state=${j.state} frames=${done}/${total}`);
    }
    if (TERMINAL_STATES.has(j.state)) {
      console.log(`\n${j.state === "done" ? "✓" : "✗"} job ${j.state} after ${elapsed}s`);
      if (j.state !== "done") process.exit(1);
      console.log("\nDownload outputs from https://app.zer0onelab.com/de/renders/" + jobId);
      return;
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
}
