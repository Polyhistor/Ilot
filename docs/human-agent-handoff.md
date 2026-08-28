# Human Agent Handoff — Problem Statement & Handover

> **Last updated:** 28 August 2026
> **Status:** 🔴 **OPEN DEFECT IN PRODUCTION.** Every customer who completes the commitment
> gate is currently dropped. No human is ever notified.
> **Scope:** this document covers the *human agent handoff* only. The WhatsApp number cutover
> is finished and documented separately in
> [`whatsapp-cutover-status.md`](./whatsapp-cutover-status.md) — read that first for the
> Meta/WABA context, it is accurate.

If you read nothing else, read [The defect](#the-defect) and
[Do this first](#do-this-first-30-minutes-stops-the-bleeding).

---

## TL;DR

| | Item | State |
|---|---|---|
| 1 | Bot answers inbound WhatsApp, captures leads, books meetings | ✅ Working |
| 2 | Commitment gate (email + docs → `Trigger Assign Agent (#5)`) | ✅ Working |
| 3 | **`Agents` table populated** | ❌ **0 rows — this is the defect** |
| 4 | **Ops fallback alert** | ❌ Sends to literal `REPLACE_WITH_OPS_FALLBACK_NUMBER` |
| 5 | **`Notify Agent (WhatsApp)`** | ❌ Structurally cannot work (see [why](#why-notify-agent-whatsapp-cannot-work-as-written)) |
| 6 | Agent replies to customer | ⚠️ By design, from the agent's **personal phone** |
| 7 | AI takeover flag (stop bot when human joins) | ❌ Does not exist |

**Net effect: 100% of committed cases are silently lost.** Both branches of the
`Agent Found?` IF node are broken — the true branch has no agents to find, and the false
branch sends to a placeholder string.

---

## The defect

`Ilot - Assign Agent (#5)` (workflow `Ez08kr0HLdziPPwy`) is called by the commitment gate.
Trace the live data through it:

```
Get Active Agents (dept)          → NocoDB Agents, where department=X and active=true
                                    → table has 0 rows → returns nothing
Pick Least-Loaded Agent           → correctly returns { assigned: false }
Agent Found?                      → false branch
Ops Alert: No Agent               → sends WhatsApp to "REPLACE_WITH_OPS_FALLBACK_NUMBER"
                                    → invalid recipient → node fails
```

Nobody is notified. The customer *does* get told a case officer was assigned (that message
only fires on the **true** branch, so in practice they get nothing at all). The lead sits in
NocoDB with `assigned_agent_id` empty and no human ever sees it.

**Verified 28 Aug 2026** via the NocoDB REST API with a logged-in session:
`GET /api/v2/tables/mcgjknbniocnvk7/records` → `200`, `list.length === 0`.

The `Agents` table schema itself is correct and needs no changes:

| Column | Type | Notes |
|---|---|---|
| `Id` | ID | |
| `name` | SingleLineText | used in the customer confirmation message |
| `phone` | SingleLineText | E.164, no `+` (e.g. `6281…`) — see the caveat below |
| `department` | SingleLineText | **must match `Clients.Department` values exactly** |
| `active` | Checkbox | default `0` — **remember to tick it** |
| `slack_id` | SingleLineText | unused; repurpose for the Mattermost user/channel |
| `open_cases` | Number | incremented by the flow; seed as `0`, not null |

### `department` is a free-text join and will bite you

`Get Active Agents (dept)` filters `=(department,eq,{{ $json.department }})~and(active,eq,true)`.
Both sides are `SingleLineText`. Observed values in `Clients.Department` include
**`company`** (lowercase). There is no constraint, no enum, and no trimming — a row with
`Company` or `company ` matches nothing and fails **silently down the same broken path**,
which looks identical to the bug you just fixed. Seed departments by copying exact strings
out of the `Clients` table:

```sql
-- conceptually; do it via the NocoDB UI or API
select distinct Department from Clients;
```

---

## Why `Notify Agent (WhatsApp)` cannot work as written

This is the part that is *not* obvious and will waste your day if you assume the placeholder
is the only problem.

```json
{
  "operation": "send",
  "recipientPhoneNumber": "={{ $('Pick Least-Loaded Agent').item.json.agent_phone }}",
  "textBody": "New committed case assigned to you.\nName: {{ … }}\nService: {{ … }}\nOpen the customer chat: https://wa.me/{{ … customer_phone }}"
}
```

Two independent blockers:

1. **It is a business-initiated message.** The WABA has **no payment method**
   (`health_status` error `141006`). Sends are therefore restricted to the **24-hour customer
   service window**, which only opens when *that recipient* messages your number. An agent who
   has never texted the bot has no open window, so the send fails regardless of the number
   being valid.
2. **Free-form text is not template-shaped.** Outside the window you must use a
   **pre-approved template** with fixed structure and typed variables. You cannot pour an
   arbitrary case summary into one. This node needs rewriting, not a parameter swap.

**Do not "fix" this by adding a payment method and calling it done.** Billing + a template
would let the message send, but the `Agents` table would *still* be empty, so the flow would
still take the false branch and still notify nobody. Billing does not touch the actual defect.

---

## The design question, and the recommendation

The current design has the agent click `wa.me/{customer_phone}` and message the client **from
their own personal phone**. Three consequences, in the order they matter for a legal services
firm:

1. **No audit trail.** The client conversation happens entirely outside your systems. Nothing
   in NocoDB, nothing reviewable. For legal work this is the serious one.
2. **Personal numbers leak** to clients, permanently.
3. **The client is messaged by an unknown number** after being told "Ilot Legal" would be in
   touch.

**Recommended target: notify agents in Mattermost, and relay their replies back out through
the Cloud API number** so the client sees one continuous thread with "Ilot Legal".

Rationale: internal staff notification and external client contact are different problems, and
only the second belongs on WhatsApp. Paying Meta per message — with template rigidity, approval
latency and rejection risk — to notify **your own staff** is the wrong tool when you already
self-host a chat system.

### Mattermost is available and suitable (verified 28 Aug 2026)

`GET /api/v4/config/client?format=old` on `mattermost.ilotlegal.com`:

| Setting | Value |
|---|---|
| `Version` | `10.11.15` |
| `EnableIncomingWebhooks` | **`true`** ← inbound alerts work today, no config needed |
| `EnableOutgoingWebhooks` | **`true`** ← needed to relay agent replies back |
| `EnableBotAccountCreation` | **`false`** ← blocker for a clean bot identity, see below |
| `EnableUserAccessTokens` | **`false`** ← blocker for API-based posting |
| Team | one team, `test` |

Free, unlimited, no 24-hour window, no template approval, and rich enough to carry a full case
summary. The unused `slack_id` column suggests chat-based notification was the original intent.

> **Two settings you will need to flip** (System Console → Integrations) if you go past Tier 1:
> `EnableBotAccountCreation` and `EnableUserAccessTokens` are both **off**. Incoming webhooks
> work without them, so **Tier 1 needs no admin changes** — but Tier 2's reply relay does.
> Note the only team is literally named `test`; consider whether production belongs there.

---

## Do this first (30 minutes, stops the bleeding)

Ordered. This stops leads being dropped without touching Meta billing at all.

1. **Seed the `Agents` table.** Real rows: `name`, `phone` (E.164, no `+`), `department`
   copied verbatim from `Clients.Department`, `active` **ticked**, `open_cases` = `0`.
   Table: <https://nocodb.ilotlegal.com/wwhn1cbz/pkm6hqm4mh9vj0s/mcgjknbniocnvk7/vwyxn0y5jkd2egua/agents-agents>
2. **Create a Mattermost incoming webhook** (Integrations → Incoming Webhooks) pointed at an
   ops channel. Copy the URL.
3. **Replace `Ops Alert: No Agent`** — swap the WhatsApp node for an HTTP Request `POST` to the
   webhook with `{"text": "⚠️ No active agent in department '…' for committed case …"}`.
   This removes the `REPLACE_WITH_OPS_FALLBACK_NUMBER` placeholder entirely.
4. **Replace `Notify Agent (WhatsApp)`** with the same pattern — post the case summary to
   Mattermost, mentioning the agent (`@username` via `slack_id`). Sidesteps both the window and
   the template problem.
5. **Leave `Confirm to Customer` on WhatsApp.** It messages the *customer*, who just messaged
   you, so it is inside the 24-hour window and is legitimately free and working.
6. **Publish, and verify against `activeVersion`** — see [the n8n trap](#the-n8n-trap-that-will-fake-your-success).
7. **Test end to end**: real inbound message → commitment gate → assignment → confirm the
   Mattermost post arrives *and* `Clients.assigned_agent_id` is populated.

## Then (half a day) — the real fix

8. **Add a `takeover` boolean to `Clients`** and gate the `AI Agent` node on it. Without this
   the bot keeps replying over the top of your human agent, which is worse than no handoff.
9. **Relay agent replies** from Mattermost back through the Cloud API number via an outgoing
   webhook → n8n → WhatsApp send. Requires the two Mattermost settings above.
10. Log every relayed message so the thread is auditable.

## In parallel, not first — Meta billing + template

Start these now because **approval latency is outside your control**, but do not block the
steps above on them. They are required for exactly one capability: contacting a customer
**more than 24 hours** after their last message (the "assign an agent a bit later" case).

11. **Add a payment method** to the WABA → clears `health_status` `141006`.
12. **Submit one utility template** (e.g. "your case officer will contact you shortly").
13. **Resubmit business verification.** It is currently **`Rejected`**. The legal name and
    website were empty and are now populated (`PT INTERNATIONAL LIVING ONE TOUCH` /
    `https://ilotlegal.com`), which was almost certainly the original cause.
    ⚠️ **Only 3 attempts per portfolio** — check the documents match the legal name *exactly*
    before submitting. While rejected you are capped at **250 unique recipients / 24 h**, which
    constrains templated sending anyway.

---

## Key IDs

| Thing | Value |
|---|---|
| NocoDB workspace / base | `wwhn1cbz` / `pkm6hqm4mh9vj0s` |
| **`Agents` table** | **`mcgjknbniocnvk7`** |
| `Clients` table | `m1q8u8q393tf6ej` |
| `FAQs` table | `miltd46do8tcznj` |
| `processed_emails` table | `mx9k2n7fxp1zax1` |
| Workflow — Inbound Whatsapp | `EHTyQZSnZMZsespF` |
| Workflow — Commitment Gate (#4) | `Lgrc2W90RxRo0EPG` |
| **Workflow — Assign Agent (#5)** | **`Ez08kr0HLdziPPwy`** ← the one to fix |
| Workflow — Calendar Check / Book (sub) | `fbNF72OFmS0rRtuv` / `KB1esFv6zhbDHTkK` |
| Live Cloud API phone number ID | `1231024886758816` (+62 819-9480-0946) |
| Old sandbox phone number ID | `1063131786890917` |
| Target WABA | `881512055018127` |
| Mattermost | <https://mattermost.ilotlegal.com> (v10.11.15, team `test`) |

---

## Traps that will cost you time

### The n8n trap that will fake your success

n8n **2.10.2+** keeps a draft (top-level `nodes`) and a published snapshot (`activeVersion`).
**Production runs `activeVersion`.** `PATCH /rest/workflows/<id>` returns `200`, updates
`updatedAt`, and edits **only the draft**. Re-reading `data.nodes` shows your change and looks
green while production keeps running the old config. This already caused a false "done" on
this project once.

Publish with:

```
POST /rest/workflows/<id>/activate
body: {"versionId": "<the DRAFT's top-level versionId>", "versionName": "..."}
```

**Verify against `activeVersion`, never `nodes`.**

### `n8n-workflows/` in this repo is STALE — do not trust it

The committed JSONs (`ilot-inbound-whatsapp.json`, `ilot-outbound-status-updates.json`) still
carry the **old sandbox** `phoneNumberId` `1063131786890917`, and there is **no file at all**
for `Ilot - Assign Agent (#5)` — the workflow you need to fix is not in the repo. Live n8n is
the source of truth. Export from n8n; do not edit these files and expect anything to happen.

### `docs/archive/whatsapp-setup/` is stale (14 May)

Different lineage, pre-cutover. It documents the sandbox number as the live target and
references a "Prod WABA" that does not appear in Business Settings.
`whatsapp-cutover-status.md` supersedes it for anything number/WABA related.

### Other

- **`__n8n_BLANK_VALUE_<uuid>` is a redaction sentinel, not a wiped value.** The same UUID
  appears for every password-type field across all credentials. Do not report data loss.
- **n8n's public API cannot read credentials.** `GET /api/v1/credentials/<id>` → `405`. Use a
  logged-in session against `/rest/credentials/<id>?includeData=true` with a `browser-id`
  header (read it from `localStorage.getItem('n8n-browserId')`).
- **`health_status` is the highest-signal Meta endpoint.** Query it first on any "cannot send"
  problem: `GET /v25.0/{phone-number-id}?fields=health_status`. It reports per entity
  (BUSINESS / WABA / phone number).
- **Do not diagnose from the developer-app use-case page** — it is a static checklist with
  fake time estimates showing no real state. Real state lives on `business.facebook.com`.

---

## Other known issues (pre-existing, not part of this defect)

- **`SANITY_API_WRITE_TOKEN` and `SANITY_API_READ_TOKEN` are identical** 180-char values, so
  the build carries write access. Worth a security review.
- **Display name review** for "Ilot Legal" is `Pending`. Cosmetic only.

---

## Verification status of this document

Verified live on 28 August 2026:

- `Agents` table row count `0` — NocoDB REST API, authenticated session
- `Agents` / `Clients` column schemas — NocoDB meta API
- Mattermost version and webhook/bot/token settings — `/api/v4/config/client`
- Stale `phoneNumberId` and the missing assign-agent file in `n8n-workflows/` — `grep` of this repo
- `wa.me/6281994800946` resolves profile name **"Ilot Legal"**; the live site serves 9
  `wa.me/6281994800946` links on `/` and 3 on `/contact`

**Not independently verified — check before relying on it:**

- **Live node parameters of `Ez08kr0HLdziPPwy`.** The n8n session in the available browser was
  logged out, so the node analysis above comes from a local backup taken **18 Aug**
  (`~/ilot-wa-cutover/backup/`). `whatsapp-cutover-status.md` states the `phoneNumberId` was
  repointed to `1231024886758816` and published; the `REPLACE_WITH_OPS_FALLBACK_NUMBER`
  placeholder and the WhatsApp-based notify design are recorded there as still outstanding.
  **Re-read the live workflow before editing.**
- **Current Meta per-message pricing for Indonesia** — consult Meta's pricing page.
- Whether the `test` Mattermost team is intended to be production.
