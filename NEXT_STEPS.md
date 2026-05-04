# ILOT — What's Next (verified against live official docs, May 2026)

> **About this doc.** Every URL and quote below was fetched live from the official source on **4 May 2026**. Any place where the official page paraphrases rather than quotes is marked *(paraphrased)*. Meta in particular renames things often — re-check the Meta URLs quarterly.

**Current state**

- Hostinger VPS is live, Coolify installed on it.
- A domain is pointed at the VPS (placeholder: `ilot.example` — swap in the real one).
- A Facebook developer account exists.

**Goal**
From "Coolify is up" to "a WhatsApp message from a client fires the n8n bot, the conversation appears in Chatwoot, and the right department team is assigned." ~1 working day of infra work **+ 1–3 business days waiting for Meta** (display-name review and Business Verification). Start Phase 1 (Meta) **in parallel** with Phase 2 (n8n) because Meta is the long pole.

---

## Phase 0 — Finish and secure the Coolify install (15 min, do first)

### 0.1 Claim the root admin account immediately

**Docs:** <https://coolify.io/docs/get-started/installation>
**Verbatim from the page (DANGER callout):** *"Immediately create your admin account after installation. If someone else accesses the registration page before you, they might gain full control of your server."*

1. Open `http://<VPS_IP>:8000`.
2. Register email + strong password.

### 0.2 Put the Coolify dashboard itself behind your domain on HTTPS

The "instance-settings" page I originally cited does **not** exist on coolify.io — the real procedure is covered in the installation doc and DNS doc combined. What's actually documented is:

- **Installation doc** (<https://coolify.io/docs/get-started/installation>) — installing with `curl … | bash`, then accessing `http://<IP>:8000` for the first time.
- **DNS configuration doc** (<https://coolify.io/docs/knowledge-base/dns-configuration>) — *"You can configure a wildcard domain for your applications, so you don't have to configure each domain separately."* (verbatim)

**Steps (current UI):**
1. DNS → **A record** `coolify.ilot.example` → VPS IP.
2. DNS → **wildcard A record** `*.ilot.example` → VPS IP.
3. In Coolify UI → top-right user menu → **Settings** (the first item in the left nav on the settings screen is labelled "Configuration") → set the **Instance's Domain** field to `https://coolify.ilot.example` → **Save**. Coolify's bundled Traefik will request the Let's Encrypt cert on the next request.
4. Verify `https://coolify.ilot.example` serves the dashboard over TLS. Stop using the raw IP:8000.

### 0.3 Firewall / ports

`https://coolify.io/docs/get-started/installation` lists the firewall requirements. Open **80, 443, 8000, 6001, 6002** on the Hostinger VPS firewall.

```bash
# on the VPS
ss -ltnp | grep -E ':(80|443|8000|6001|6002)\b'
# if Hostinger shipped nginx/apache pre-installed, kill them:
systemctl disable --now apache2 nginx 2>/dev/null || true
```

### 0.4 Enable automatic backups

**Docs:** <https://coolify.io/docs/knowledge-base/backups>
Coolify supports scheduled backups for each Postgres/MySQL/MariaDB/MongoDB resource (S3 or local). Enable it **before** putting data in the system — the UI is per-database under the database's own **Backups** tab.

> *No auto-update scheduler URL existed at `knowledge-base/server/auto-updates` — that URL I cited originally was wrong. Coolify's self-update toggle is in UI → Settings → Update, driven by the installer's cron; no dedicated docs page.*

---

## Phase 1 — Meta / WhatsApp Business Platform onboarding (start now, 1–3 business days)

> **Important:** Meta migrated the entire WhatsApp developer doc tree in 2024–2025 from `developers.facebook.com/docs/whatsapp/cloud-api/*` to `developers.facebook.com/documentation/business-messaging/whatsapp/*`. Old URLs still 301-redirect, but the canonical URLs are the new ones below.

### 1.1 Create / confirm the Meta Business Portfolio (ex-"Business Manager")

**Docs:** <https://developers.facebook.com/documentation/business-messaging/whatsapp/cloud-api/overview> (old URL `/docs/whatsapp/cloud-api/overview` redirects here)

Key concept from the live page: *(paraphrase)* a **business portfolio** (new name for "Business Manager" account) is the container that holds your WhatsApp Business Account (WABA), phone numbers, system users, and assets.

- Go to <https://business.facebook.com/> → create a portfolio for ILOT → add legal business name, website, physical address.
- **Start Business Verification in parallel** via Business Manager → **Security Center → Start Verification**. Docs: <https://www.facebook.com/business/help/1710077379203657> ("About business verification"). You'll need ILOT's registration docs (Akta Pendirian / NIB if the entity is Indonesian). This review can take several days; don't block on it, but it must be complete before you can register **marketing** templates and before Meta will raise your messaging tier meaningfully.

### 1.2 Create the App and add the WhatsApp product

**Docs:** <https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started> (old URL `/docs/whatsapp/cloud-api/get-started` redirects here — note: the separate "Add a phone number" doc has been **deleted and folded into this single get-started page**, so don't look for it).

1. <https://developers.facebook.com/apps/> → **Create App** → App type **Business** → link to the portfolio from 1.1.
2. App dashboard → **Add Products** → **WhatsApp → Set up**.
3. Meta auto-provisions a **test WABA** + a **test phone number** (e.g. `+1 555 …`). You can send from this number free of charge to up to **5 recipient phone numbers** that you explicitly whitelist.

### 1.3 Capture the IDs you'll paste elsewhere

On the same **WhatsApp → API Setup** tab, copy:
- **Phone Number ID** — the ID of the test (or later, production) number.
- **WhatsApp Business Account (WABA) ID**.
- **App ID** and **App Secret** (for webhook signature verification).

### 1.4 Generate a **non-expiring** System User access token

**This is the single most important step in Phase 1.** A "user" access token copied from the API Setup tab only lives **24 hours**; the moment it dies, n8n + Chatwoot silently stop working. The production-grade token is a **System User** token.

**Docs:**
- System user tokens overview: <https://developers.facebook.com/docs/development/create-an-app/app-dashboard/system-users/> and the WhatsApp-specific guide <https://developers.facebook.com/documentation/business-messaging/whatsapp/business-management-api/get-started>
- Business Help Center: <https://www.facebook.com/business/help/503306463479099> ("Add system users to your business portfolio")
- The URL that actually loads today (the old `/settings/system-users` 302-redirects to the login wall, but the live canonical path is under `/latest/`): <https://business.facebook.com/latest/settings/system_users>

Procedure:
1. <https://business.facebook.com/latest/settings/system_users> → **Add** → name `n8n-whatsapp-bot`, role **Admin**.
2. Select the system user → **Add Assets** → choose the **WhatsApp Account** (the WABA) → grant **Full Control**.
3. **Generate New Token** → pick the App from 1.2 → scopes **`whatsapp_business_messaging`** + **`whatsapp_business_management`** → **Token expiration: Never** → **Generate** → copy the token to your password manager immediately (Meta won't show it again).

> **Re-check at go-live:** Meta has been tightening token policy; if the "Never" option has been removed by the time you reach this step, you'll see only "60 days" — in that case plan for a monthly rotation job (an n8n Cron → regenerate via Graph API → update Chatwoot inbox + n8n credential). This is a Meta-side change, not a doc error.

### 1.5 Add the real (production) phone number

Flow documented in the get-started page (Section "Add a phone number"). Meta removed the standalone doc URL I had originally (`/cloud-api/get-started/add-a-phone-number` — **404 today**). Do it from WhatsApp Manager:
- <https://business.facebook.com/wa/manage/> → **Phone numbers → Add phone number**.
- Verify by SMS or voice call.
- Pick a **Display Name** — Meta reviews this (usually 24–72 h). It can be rejected if it doesn't match ILOT's registered trading name.

### 1.6 Understand messaging limits — **the numbers I had before were wrong**

**Docs:** <https://developers.facebook.com/documentation/business-messaging/whatsapp/cloud-api/messaging-limits> (old URL `/docs/whatsapp/cloud-api/phone-numbers/messaging-limits` redirects here).

**Verbatim from the live page today:**
> *"Messaging limits are the maximum number of unique WhatsApp user phone numbers your business can deliver messages to, outside of a customer service window, within a moving 24-hour period."*
> *"Messaging limits are calculated and set at the business portfolio level and are shared by all business phone numbers within a portfolio."*
> *"Newly created business portfolios have a messaging limit of 250, but this limit can be increased to:"* → **2,000** (scaling path), **10,000** (automatic scaling), **100,000** (automatic scaling), **Unlimited** (automatic scaling).

So the current ladder is **250 → 2,000 → 10,000 → 100,000 → Unlimited**, scoped to the **portfolio** (not the phone number), with the first step (to 2,000) requiring a "scaling path" event and everything past that being automatic based on quality + volume. **The old "Tier 1 / Tier 2 / Tier 3" 1K/10K/100K framing is obsolete** — the terminology changed.

### 1.7 Don't configure the webhook yet

The webhook URL points at Chatwoot (we haven't deployed it yet). You'll come back here at **Phase 4.3**.

---

## Phase 2 — Deploy n8n via Coolify (20 min)

**Docs:** <https://coolify.io/docs/services/n8n> confirms n8n is a first-class one-click service template.
**Docs (services overview):** <https://coolify.io/docs/services/overview> *"Coolify provides a list of one-click services that you can deploy with a single click."* (verbatim).

### 2.1 Project → Service

1. Coolify → **Projects → + New** → name `ilot`.
2. Environment "production" auto-created.
3. **+ New Resource → Service → n8n**.

### 2.2 Set the public domain

In the new service's **Environment / Configuration** tab, the **Domains** field → `https://n8n.ilot.example`. Coolify configures Traefik routing + Let's Encrypt for the subdomain automatically (covered in the DNS doc cited in 0.2).

### 2.3 Set the environment variables n8n requires in production

**Docs:** <https://docs.n8n.io/hosting/configuration/environment-variables/deployment/>

Verified verbatim on the live page today:
- `N8N_HOST` — *"Host name n8n runs on."*
- `N8N_PROTOCOL` — *"The protocol used to reach n8n."*
- `N8N_EDITOR_BASE_URL` — *"Public URL where users can access the editor. Also used for emails sent from n8n and the redirect URL for SAML based authentication."*
- `N8N_ENCRYPTION_KEY` — *"Provide a custom key used to encrypt credentials in the n8n database. By default n8n generates a random key on first launch."* **Set this ONCE and never change it — rotating invalidates every saved credential.**

**Docs:** <https://docs.n8n.io/hosting/configuration/environment-variables/endpoints/>
Verbatim: `WEBHOOK_URL` — *"Used by webhook nodes to construct the URL where they can be reached. Should include protocol and domain."* (I previously paraphrased this sentence; this is the exact one.)

**Docs (task runners):** <https://docs.n8n.io/hosting/configuration/task-runners/>
*(paraphrased — the page talks about task runners being the current default for new installs and explains the opt-in env var.)* The opt-in env var is `N8N_RUNNERS_ENABLED=true`.

**Docs (supported databases):** <https://docs.n8n.io/hosting/configuration/supported-databases-settings/> — `DB_TYPE=postgresdb` is the exact string; `DB_TYPE=sqlite` is the default.

Values to paste into Coolify's n8n service → **Environment Variables**:

```env
N8N_HOST=n8n.ilot.example
N8N_PROTOCOL=https
N8N_PORT=5678
N8N_EDITOR_BASE_URL=https://n8n.ilot.example
WEBHOOK_URL=https://n8n.ilot.example/
N8N_ENCRYPTION_KEY=<openssl rand -hex 32>   # generate once, save in 1Password, NEVER change
N8N_RUNNERS_ENABLED=true
EXECUTIONS_MODE=regular                      # "queue" + Redis only required once you're past ~100 concurrent executions
GENERIC_TIMEZONE=Asia/Jakarta
TZ=Asia/Jakarta
```

Coolify's n8n service template already wires `DB_TYPE=postgresdb` and `DB_POSTGRESDB_*` to the sibling Postgres container — don't override those.

Click **Deploy** → wait for green.

### 2.4 Owner account

<https://n8n.ilot.example> → create owner account. Community (free) is fine.

### 2.5 Back up n8n

In Coolify, the Postgres sub-resource under the n8n stack has its own **Backups** tab (per `knowledge-base/backups` doc) — enable daily. Also snapshot the `/home/node/.n8n` volume (binary files + the encryption key).

---

## Phase 3 — Deploy Chatwoot via Coolify (20 min)

**Docs:** <https://developers.chatwoot.com/self-hosted> is the current canonical self-hosting landing page. Docker deployment at <https://developers.chatwoot.com/self-hosted/deployment/docker>.

Verbatim from the Docker deployment page:
> *"If you want to run Chatwoot CE edition, replace the docker image tag with equivalent foss version tag. Docker tag for current `master` would be `latest-ce`. Version specific tags would follow the pattern `v*-ce`."*

### 3.1 Deploy

Coolify → same `ilot` project → **+ New Resource → Service → Chatwoot**. Domain → `https://chat.ilot.example`. Make sure the image is the `-ce` / FOSS variant (community edition) unless you're paying for the enterprise features.

### 3.2 Required env vars (from <https://developers.chatwoot.com/self-hosted/configuration/environment-variables>)

The page lists all of these with descriptions:

```env
FRONTEND_URL=https://chat.ilot.example      # must match the domain Meta will call
SECRET_KEY_BASE=<openssl rand -hex 64>       # never rotate — invalidates all sessions + encrypted cookies
RAILS_ENV=production
NODE_ENV=production
INSTALLATION_ENV=docker
DEFAULT_LOCALE=en
ENABLE_ACCOUNT_SIGNUP=false                  # turn OFF public sign-ups once your team is invited
MAILER_SENDER_EMAIL="ILOT <notifications@ilot.example>"
SMTP_ADDRESS=...
SMTP_PORT=587
SMTP_USERNAME=...
SMTP_PASSWORD=...
SMTP_AUTHENTICATION=plain
SMTP_ENABLE_STARTTLS_AUTO=true
ACTIVE_STORAGE_SERVICE=local                 # move to S3 once attachments > ~10 GB
```

Coolify's Chatwoot template wires `POSTGRES_*` and `REDIS_URL` to sibling containers.

Deploy → visit `https://chat.ilot.example` → create the super-admin account.

### 3.3 Create the 7 departmental Teams + invite Agents

Chatwoot → **Settings → Teams → Add New Team** × 7: `Visa`, `Legal`, `Company`, `Tax`, `Property`, `HR`, `Insurance`.
Chatwoot → **Settings → Agents → Add Agent** → invite each department lead by email.

*(The Teams user-guide article lives at <https://www.chatwoot.com/hc/user-guide/articles/1677584080-teams-overview> but the canonical docs are on developers.chatwoot.com.)*

### 3.4 Generate a Chatwoot API access token for n8n

Chatwoot → **Profile → Access Token** → copy.
Docs: <https://developers.chatwoot.com/api-reference/introduction> — *(paraphrased)* every Application API request requires the `api_access_token` header.

---

## Phase 4 — Wire WhatsApp → Chatwoot → n8n (the only tricky part)

### 4.1 Architecture decision: who owns Meta's single webhook?

Meta posts inbound events to **exactly one URL per WABA**. Two supported patterns:

| Option | First hop | Pros | Cons |
|---|---|---|---|
| **A — Chatwoot first, Agent Bot forwards to n8n** ✅ *recommended* | Chatwoot | Single source of truth; humans and bot see one thread; n8n receives already-deduped events | Need to create an Agent Bot in Chatwoot |
| B — n8n first, n8n forwards to Chatwoot | n8n | Total control over what reaches Chatwoot | You re-implement dedupe, contact linking, media handling — bugs *will* drop messages |

**Go with A.** Rationale is straight from Chatwoot's own docs at <https://www.chatwoot.com/docs/product/channels/api/agent-bots>: Agent Bots are literally designed to sit between the inbox and the human agents and receive every new message via a webhook.

### 4.2 Create the WhatsApp Cloud inbox in Chatwoot

**Docs:** <https://www.chatwoot.com/docs/product/channels/whatsapp/whatsapp-cloud>

Chatwoot → **Settings → Inboxes → Add Inbox → WhatsApp**. When it asks for the API Provider, pick **WhatsApp Cloud** (sometimes labelled "WhatsApp via Meta" in newer builds — same thing).

Fields the Chatwoot UI asks for:

| Field | Value |
|---|---|
| Phone Number | your test or production WhatsApp number (E.164, e.g. `+14155552671`) |
| Phone Number ID | from 1.3 |
| Business Account ID | from 1.3 |
| API Key | the **never-expiring** System User token from 1.4 |
| Webhook Verify Token | any random string you invent — `openssl rand -hex 16` is fine |

On save, Chatwoot displays **two values to paste into Meta** in the next step:
- **Callback URL** in the format `https://chat.ilot.example/webhooks/whatsapp/<phone_number>` (confirmed against the whatsapp-cloud docs page).
- **Verify Token** (the one you just entered).

### 4.3 Register the webhook in Meta

**Docs:** <https://developers.facebook.com/docs/graph-api/webhooks/getting-started>
The live page describes the verification handshake: *(paraphrased)* when you save a webhook subscription, Meta issues an HTTP **GET** to the callback URL with `hub.mode=subscribe`, `hub.challenge=<random>`, and `hub.verify_token=<your token>`; your endpoint must respond 200 with the challenge value as the body. Chatwoot's WhatsApp endpoint handles this automatically.

In the Meta app dashboard → **WhatsApp → Configuration → Webhook → Edit**:
- Callback URL: `https://chat.ilot.example/webhooks/whatsapp/<phone_number>`
- Verify Token: (same string as Chatwoot)
- **Verify and Save** — green tick = handshake succeeded.

Then **Webhook fields → Manage → subscribe to**:
- `messages` *(required — inbound)*
- `message_template_status_update` *(template approval results)*
- `message_status` *(delivery receipts — optional)*

**Docs:** <https://developers.facebook.com/documentation/business-messaging/whatsapp/cloud-api/webhooks/components> (the new canonical path).

Smoke test: send a WhatsApp to the number from a test phone → it should appear as a new conversation in Chatwoot within ~3 seconds.

### 4.4 Create the n8n Agent Bot

**Docs:** <https://www.chatwoot.com/docs/product/channels/api/agent-bots>

1. Chatwoot → **Settings → Agent Bots → Add Agent Bot** → Name `n8n-ilot-bot`. Leave Outgoing URL blank for now (you'll fill it after n8n gives you the webhook URL in 4.5). Save → copy the bot's **Access Token**.
2. Chatwoot → the WhatsApp inbox from 4.2 → **Bot Configuration** → assign `n8n-ilot-bot` → Save.

Every new conversation in that inbox now fires a `conversation_created` / `message_created` webhook to the Outgoing URL.

### 4.5 Build the n8n workflow

1. Create the three workflows described in `ILOT_Simple_Bot_Solution.md` (AI Agent + lead capture, status tracker, auto-reset).
2. For the main workflow use the **Webhook** trigger node (docs: <https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/>) — not the WhatsApp Trigger node, because events arrive from Chatwoot's Agent Bot, not from Meta directly.
3. Copy the webhook's **Production URL** → paste into the Agent Bot's **Outgoing URL** (4.4.1) → Save.
4. To reply, **HTTP Request** node back to Chatwoot (keeping all human + bot messages in one thread, instead of calling Meta directly):

   ```
   POST https://chat.ilot.example/api/v1/accounts/{account_id}/conversations/{conversation_id}/messages
   Header:  api_access_token: <bot access token from 4.4.1>
   Body:    { "content": "AI reply here", "message_type": "outgoing", "private": false }
   ```
   Docs: <https://developers.chatwoot.com/api-reference/messages/create-new-message> (verified — endpoint path and header name both current).

5. To route to a department, HTTP Request:
   ```
   POST /api/v1/accounts/{account_id}/conversations/{conversation_id}/assignments
   Body: { "team_id": <team id> }
   ```
   Docs: <https://developers.chatwoot.com/api-reference/conversation-assignments/assign-conversation> (verified — endpoint + body shape current).

6. AI Agent node config — *because the trigger is a Webhook, not the Chat Trigger*, you must change the Prompt source. The canonical reference is the AI Agent node page <https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/> and the Common-Issues sub-page of the same node (where the behaviour with non-Chat triggers is documented). Set **Prompt** → **"Define below"** and feed it `{{ $json.content }}` (the Chatwoot Agent Bot payload field holding the incoming message text). Attach **OpenAI Chat Model** + **Simple Memory** sub-nodes; set Simple Memory's `Session Key` to `{{ $json.conversation.meta.sender.phone_number }}` so each WhatsApp user keeps their own conversation memory.

### 4.6 Google Sheets & Google Drive credentials — service account

**Docs:** <https://docs.n8n.io/integrations/builtin/credentials/google/service-account/>

1. Google Cloud Console → new Service Account `n8n-ilot@…iam.gserviceaccount.com` → create a JSON key.
2. Share the Google Sheet and the `ILOT_Clients/` Drive folder **with the service-account email** as **Editor**.
3. n8n → **Credentials → New → Google (Service Account)** → paste the JSON.

### 4.7 End-to-end smoke test

Send a WhatsApp → expect: conversation appears in Chatwoot → n8n webhook execution logs show the POST → AI reply visible in Chatwoot and on the client phone → a new row in the Google Sheet → conversation assigned to the correct team in Chatwoot. If anything fails, the first place to look is the n8n execution JSON (full payload) and Chatwoot's Rails log via Coolify's per-container logs.

---

## Phase 5 — Production hardening

In priority order:

1. **Finish Meta Business Verification** (1.1). Without it you cannot register marketing templates and your portfolio is parked at the 250-unique-recipient floor.
2. **Register at least 3 utility templates** at <https://business.facebook.com/wa/manage/> → Message Templates. Docs: <https://developers.facebook.com/documentation/business-messaging/whatsapp/message-templates> (old URL `/docs/whatsapp/business-management-api/message-templates` redirects here):
   - `lead_followup_v1` (UTILITY)
   - `status_update_v1` (UTILITY)
   - `document_ready_v1` (UTILITY)
   These are required to message any user **outside the 24-hour customer-service window**.
3. **Lock down Chatwoot** — `ENABLE_ACCOUNT_SIGNUP=false`, rotate super-admin password.
4. **Coolify alerts** — <https://coolify.io/docs/knowledge-base/notifications> — Slack / Telegram / Email on deploy + backup + container-down events.
5. **Store the three irreplaceable secrets** in 1Password / Bitwarden:
   - `N8N_ENCRYPTION_KEY` (rotating = all credentials unreadable)
   - Chatwoot `SECRET_KEY_BASE` (rotating = all sessions + cookies invalid)
   - Meta System User token (regenerable, but requires re-pasting into Chatwoot + n8n every time)
6. **Plan for token rotation.** If "Expiration: Never" disappears from the Meta UI (Meta has been signalling this), schedule an n8n Cron job that regenerates the System User token via Graph API every 50 days and `PUT`s the new value into Chatwoot's inbox via `PUT /api/v1/accounts/{id}/inboxes/{id}` and updates the n8n credential.

---

## Daily-use URLs

| Purpose | URL |
|---|---|
| Coolify dashboard | `https://coolify.ilot.example` |
| n8n editor | `https://n8n.ilot.example` |
| Chatwoot | `https://chat.ilot.example` |
| Meta Apps | <https://developers.facebook.com/apps/> |
| Meta Business settings | <https://business.facebook.com/latest/settings/> |
| System Users | <https://business.facebook.com/latest/settings/system_users> |
| WhatsApp Manager (templates, phone numbers) | <https://business.facebook.com/wa/manage/> |

---

## Verified docs index (May 2026)

### Coolify (all verified 200 OK)
- Installation: <https://coolify.io/docs/get-started/installation>
- DNS / wildcard: <https://coolify.io/docs/knowledge-base/dns-configuration>
- Services overview: <https://coolify.io/docs/services/overview>
- Services → n8n: <https://coolify.io/docs/services/n8n>
- Backups: <https://coolify.io/docs/knowledge-base/backups>
- Notifications: <https://coolify.io/docs/knowledge-base/notifications>
- Full doc index (grep for anything): <https://coolify.io/docs/llms.txt>

**Originally cited but NOT real (don't link to these):**
- ~~`coolify.io/docs/knowledge-base/server/instance-settings`~~ — 404
- ~~`coolify.io/docs/knowledge-base/server/auto-updates`~~ — 404
- ~~`coolify.io/docs/knowledge-base/configuration#general`~~ — not a real anchor

### Meta / WhatsApp Business Platform (all migrated to `/documentation/business-messaging/whatsapp/`)
- Overview: <https://developers.facebook.com/documentation/business-messaging/whatsapp/cloud-api/overview>
- Get started (includes "Add a phone number"): <https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started>
- Messaging limits (250 → 2K → 10K → 100K → Unlimited, portfolio-level): <https://developers.facebook.com/documentation/business-messaging/whatsapp/cloud-api/messaging-limits>
- System User tokens: <https://developers.facebook.com/documentation/business-messaging/whatsapp/business-management-api/get-started>
- System user general: <https://developers.facebook.com/docs/development/create-an-app/app-dashboard/system-users/>
- Message templates: <https://developers.facebook.com/documentation/business-messaging/whatsapp/message-templates>
- Webhook setup (generic Graph): <https://developers.facebook.com/docs/graph-api/webhooks/getting-started>
- Webhook components (WhatsApp-specific): <https://developers.facebook.com/documentation/business-messaging/whatsapp/cloud-api/webhooks/components>
- Business verification help: <https://www.facebook.com/business/help/1710077379203657>
- Add system users help: <https://www.facebook.com/business/help/503306463479099>

### n8n (all verified 200 OK)
- Deployment env vars: <https://docs.n8n.io/hosting/configuration/environment-variables/deployment/>
- Endpoint env vars: <https://docs.n8n.io/hosting/configuration/environment-variables/endpoints/>
- Supported databases: <https://docs.n8n.io/hosting/configuration/supported-databases-settings/>
- Task runners: <https://docs.n8n.io/hosting/configuration/task-runners/>
- AI Agent node: <https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/>
- Google Service Account: <https://docs.n8n.io/integrations/builtin/credentials/google/service-account/>
- Webhook node: <https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/>

### Chatwoot (all verified 200 OK, now on Mintlify at developers.chatwoot.com)
- Self-hosted landing: <https://developers.chatwoot.com/self-hosted>
- Docker deployment: <https://developers.chatwoot.com/self-hosted/deployment/docker>
- Environment variables: <https://developers.chatwoot.com/self-hosted/configuration/environment-variables>
- WhatsApp Cloud inbox: <https://www.chatwoot.com/docs/product/channels/whatsapp/whatsapp-cloud>
- Agent Bots: <https://www.chatwoot.com/docs/product/channels/api/agent-bots>
- API reference (introduction): <https://developers.chatwoot.com/api-reference/introduction>
- Create message: <https://developers.chatwoot.com/api-reference/messages/create-new-message>
- Assign conversation: <https://developers.chatwoot.com/api-reference/conversation-assignments/assign-conversation>

---

## One-paragraph TL;DR

Harden Coolify (A + wildcard DNS, dashboard on `coolify.ilot.example` over TLS, ports 80/443/8000/6001/6002 open, backups on). In parallel, in Meta's developer console: create a Business portfolio, add a Business-type App with the WhatsApp product, grab the Phone Number ID + WABA ID, and — critically — create a **System User** at <https://business.facebook.com/latest/settings/system_users>, attach the WABA as an asset, and generate a **non-expiring** access token with `whatsapp_business_messaging` + `whatsapp_business_management`. In Coolify, deploy **n8n** (`n8n.ilot.example`) and **Chatwoot CE** (`chat.ilot.example`) as one-click services with the env vars pulled straight from the docs linked above. Point Meta's single webhook at `https://chat.ilot.example/webhooks/whatsapp/<phone_number>`, then create an **Agent Bot** in Chatwoot whose Outgoing URL is your n8n Webhook-node production URL — that's the officially-documented pattern for letting both the AI and the human agents see every message without fighting over Meta's one-webhook-per-number limit. n8n replies back via Chatwoot's `/api/v1/.../messages` endpoint, not directly to Meta, so bot + human messages share one conversation thread. Finish Business Verification and pre-register three utility templates so you're not trapped in the 24-hour customer-service window. Expect the portfolio to start at **250 unique recipients per rolling 24h** (not 1,000 — the tier numbers I originally quoted were wrong; the current ladder is 250 → 2K → 10K → 100K → Unlimited, scoped at the portfolio level).
