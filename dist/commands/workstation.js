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
import { api } from "../api.js";
async function findActive() {
    // MVP: there is no list endpoint; we know the customer has at most one
    // active workstation per row constraint (spawn returns 409 if there is
    // one).  Best we can do is try-spawn and read the "already active"
    // response for the id.
    const spawnRes = await api("/api/workstation/spawn", { method: "POST", body: { gpuTier: "a4000" } })
        .catch((e) => ({ ok: false, error: e.message }));
    if ("id" in spawnRes && spawnRes.id) {
        const detail = await api(`/api/workstation/${spawnRes.id}`);
        return detail.workstation ?? null;
    }
    return null;
}
export async function workstationOpenCommand(opts) {
    const spawn = await api("/api/workstation/spawn", { method: "POST", body: { gpuTier: opts.tier } });
    if (spawn.error === "workstation_already_active" && spawn.id) {
        console.log(`ℹ workstation already active: ${spawn.id} (state=${spawn.state})`);
        console.log(`  Open it in your browser:  https://app.zer0onelab.com/de/workstation`);
        return;
    }
    if (!spawn.ok || !spawn.id) {
        console.error("spawn failed:", spawn.error ?? "unknown");
        process.exit(1);
    }
    console.log(`✓ workstation spawning: ${spawn.id}`);
    if (spawn.accessToken) {
        console.log(`\nThe branded URL requires the one-shot access token to be in your`);
        console.log(`browser's sessionStorage.  Simplest path: open`);
        console.log(`  https://app.zer0onelab.com/de/workstation`);
        console.log(`and use the "Open Workstation" button after boot completes.`);
        console.log(`\n(Direct-open device-code flow lands in CLI 0.2.)`);
    }
}
export async function workstationTermCommand() {
    const active = await findActive();
    if (!active) {
        console.log("No active workstation to terminate.");
        return;
    }
    await api(`/api/workstation/${active.id}`, { method: "DELETE" });
    console.log(`✓ terminated ${active.id}`);
}
//# sourceMappingURL=workstation.js.map