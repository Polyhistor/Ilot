# Local dev stack

Somewhere to build and test the n8n workflows that is not production. Editing
workflows directly in the production n8n UI is how a "done" report got made for
work that was never published.

## Run order

```bash
docker compose -f docker-compose.dev.yml up -d          # n8n :5678, NocoDB :8080, catcher :4000
node scripts/dev/seed-nocodb.mjs                        # tables + sample rows, prints local IDs
docker exec ilot-n8n n8n import:workflow --separate --input=/workflows
node scripts/dev/patch-n8n-local.mjs                    # wire the imported copies to the local stack
```

First run of `seed-nocodb.mjs` signs up the NocoDB super admin. n8n asks for
owner setup on first visit to <http://localhost:5678>; use the same credentials
as `local-config.mjs` or the scripts will not be able to log in.

## Files

| File | Purpose |
|---|---|
| `local-config.mjs` | URLs, logins, and the WhatsApp HMAC secret shared by the scripts |
| `seed-nocodb.mjs` | Creates the `Agents`, `Clients`, `FAQs` tables and sample rows |
| `patch-n8n-local.mjs` | Points the imported workflows at local IDs and at webhook-catcher |
| `send-inbound.mjs` | Signs and posts `fixtures/whatsapp-inbound.json` at the WhatsApp trigger |
| `webhook-catcher.mjs` | Prints any request it receives; stands in for Mattermost and WhatsApp sends |

## Local IDs never go in the repo

`n8n-workflows/*.json` holds production IDs. `patch-n8n-local.mjs` only writes to
the copies inside n8n, and the compose file mounts `n8n-workflows/` read-only so
an import cannot write back. Local table IDs belong in the local n8n and nowhere
else.

## What cannot run here

- **Meta WhatsApp Cloud API.** Inbound is simulated by the fixture. Outbound is
  replaced with an HTTP Request to webhook-catcher. Activating a workflow that
  contains the WhatsApp *trigger* fails with `Invalid Client ID` — activation
  calls Meta's Graph API to check the app's webhook subscription, so that node
  cannot be activated without a real Meta app.
- **Google Gemini.** Without an API key the AI Agent, the embeddings, and the
  vector store branches do not run. That blocks the inbound workflow and the FAQ
  reindex, but not the assign-agent work.
- **Gmail trigger** for the Commitment Gate, and **Assign Agent (#5)**, which is
  not in this repo.

## The draft / activeVersion trap

n8n keeps a draft (top-level `nodes`) and a published snapshot (`activeVersion`),
and it runs `activeVersion`. `PATCH /rest/workflows/<id>` returns `200` and
changes only the draft. Publish with `POST /rest/workflows/<id>/activate`
(body `{"versionId": "<current versionId>"}`), then read the workflow back and
check `activeVersion` — never `nodes`.
