# Archive

Historical record. **Nothing in this folder describes how the project works today** — it is kept
because it explains why things ended up the way they did, and because some of it contains
credentials-adjacent setup detail that would be painful to reconstruct.

Do not follow any runbook in here without checking it against the active docs first.

| Archived | What it was | Read instead |
|---|---|---|
| `NEXT_STEPS.md` | MVP build plan, verified against Meta/Coolify docs on 4 May 2026. Carried out. | [`../HUMAN_AGENT_HANDOFF.md`](../HUMAN_AGENT_HANDOFF.md) for the current state |
| `ILOT_Simple_Bot_Solution.md` | Architecture argument for WhatsApp + n8n + Sheets over a Slack bridge. The decision it argues for is the one that shipped. | — |
| `whatsapp-setup/` | Five setup runbooks, last touched 14 May 2026. `STATUS.md` already marked itself superseded for anything number- or WABA-related. | [`../WHATSAPP_CUTOVER_STATUS.md`](../WHATSAPP_CUTOVER_STATUS.md) |
| `superpowers/plans/`, `superpowers/specs/` | Phase plans and specs from April–May 2026 for the Sanity migration, blog, and regulatory updates. All landed. | The code, plus [`../DESIGN.md`](../DESIGN.md) |
| `seed-data-services.json` | Earlier shape of the service catalogue. | [`../seed-data-raw.json`](../seed-data-raw.json), the file the importer reads |
| `Proposal-ILOT-One-Touch-Digital-Ecosystem.{docx,pdf}` | Client-facing proposal. | — |

Two things the archived docs get wrong about the repo as it stands: they reference a `supabase/`
folder (removed — its one live file is now `docs/seed-data/legacy-categories.sql`) and
`src/lib/supabase/`, `src/sanity/lib/writeClient.ts`, `src/sanity/lib/image.ts`,
`scripts/lib/normalize.ts` (all deleted as unreachable).
