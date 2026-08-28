// Wires the imported n8n workflows to the local stack.
//
//   docker exec ilot-n8n n8n import:workflow --separate --input=/workflows
//   node scripts/dev/patch-n8n-local.mjs
//
// What it changes, on the copies inside n8n only:
//   - creates/reuses the local NocoDB + WhatsApp credentials
//   - repoints every NocoDB node at the local base and table IDs
//     (including the REPLACE_WITH_NOCODB_FAQS_TABLE_ID placeholder)
//   - swaps every WhatsApp *send* node for an HTTP Request to webhook-catcher,
//     keeping the node name so connections and $('...') references still resolve
//
// It never writes to n8n-workflows/*.json. Those keep the production IDs.

import {
  NOCODB_URL, NOCODB_EMAIL, NOCODB_PASSWORD, NOCODB_BASE,
  N8N_URL, N8N_EMAIL, N8N_PASSWORD,
  NOCODB_INTERNAL_URL, CATCHER_INTERNAL_URL, WHATSAPP_CLIENT_SECRET,
} from './local-config.mjs'

async function req(url, { method = 'GET', headers = {}, body } = {}) {
  const res = await fetch(url, {
    method,
    headers: { 'content-type': 'application/json', ...headers },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${method} ${url} -> ${res.status}\n${text.slice(0, 500)}`)
  return { json: text ? JSON.parse(text) : null, res }
}

// ---------------------------------------------------------------- NocoDB ---

async function nocodb() {
  const { json: auth } = await req(`${NOCODB_URL}/api/v1/auth/user/signin`, {
    method: 'POST',
    body: { email: NOCODB_EMAIL, password: NOCODB_PASSWORD },
  })
  const h = { 'xc-auth': auth.token }

  const { json: bases } = await req(`${NOCODB_URL}/api/v2/meta/bases`, { headers: h })
  const base = (bases.list || []).find((b) => b.title === NOCODB_BASE)
  if (!base) throw new Error(`base "${NOCODB_BASE}" not found — run scripts/dev/seed-nocodb.mjs first`)

  const { json: tables } = await req(`${NOCODB_URL}/api/v2/meta/bases/${base.id}/tables`, { headers: h })
  const byTitle = Object.fromEntries((tables.list || []).map((t) => [t.title, t.id]))
  for (const needed of ['Agents', 'Clients', 'FAQs']) {
    if (!byTitle[needed]) throw new Error(`table "${needed}" missing — run scripts/dev/seed-nocodb.mjs first`)
  }

  const { json: tokens } = await req(`${NOCODB_URL}/api/v1/tokens`, { headers: h })
  const existing = (tokens.list || tokens || []).find?.((t) => t.description?.startsWith('ilot-dev'))
  const apiToken = existing?.token
    ? existing.token
    : (await req(`${NOCODB_URL}/api/v1/tokens`, {
        method: 'POST', headers: h, body: { description: 'ilot-dev patch-n8n-local' },
      })).json.token

  return { baseId: base.id, tables: byTitle, apiToken }
}

// ------------------------------------------------------------------- n8n ---

async function login() {
  const { res } = await req(`${N8N_URL}/rest/login`, {
    method: 'POST',
    body: { emailOrLdapLoginId: N8N_EMAIL, password: N8N_PASSWORD },
  })
  const cookies = res.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ')
  if (!cookies) throw new Error('n8n login returned no cookie')
  return { cookie: cookies }
}

async function upsertCredential(auth, { name, type, data }) {
  const { json } = await req(`${N8N_URL}/rest/credentials`, { headers: auth })
  const list = json.data || json
  const found = list.find((c) => c.name === name)
  if (found) {
    await req(`${N8N_URL}/rest/credentials/${found.id}`, {
      method: 'PATCH', headers: auth, body: { name, type, data },
    })
    return { id: found.id, name }
  }
  const { json: created } = await req(`${N8N_URL}/rest/credentials`, {
    method: 'POST', headers: auth, body: { name, type, data },
  })
  return { id: (created.data || created).id, name }
}

// A WhatsApp send node becomes an HTTP Request to webhook-catcher. The name and
// position are kept so the workflow graph is untouched.
function toCatcherNode(node) {
  const strip = (v) => (typeof v === 'string' ? v.replace(/^=/, '').trim() : '')
  const to = strip(node.parameters?.recipientPhoneNumber)
  const text = strip(node.parameters?.textBody)

  return {
    ...node,
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    credentials: undefined,
    parameters: {
      method: 'POST',
      url: `${CATCHER_INTERNAL_URL}/whatsapp-send`,
      sendBody: true,
      contentType: 'json',
      specifyBody: 'keypair',
      bodyParameters: {
        parameters: [
          { name: 'stand_in_for', value: `${node.type} (${node.name})` },
          { name: 'to', value: to ? `=${to}` : '' },
          { name: 'text', value: text ? `=${text}` : '' },
        ],
      },
      options: {},
    },
  }
}

async function main() {
  const nc = await nocodb()
  console.log(`NocoDB base ${nc.baseId}`)
  for (const [t, id] of Object.entries(nc.tables)) console.log(`  ${t.padEnd(8)} ${id}`)

  const auth = await login()
  console.log(`logged in to n8n as ${N8N_EMAIL}`)

  const nocoCred = await upsertCredential(auth, {
    name: 'NocoDB (local dev)',
    type: 'nocoDbApiToken',
    data: { host: NOCODB_INTERNAL_URL, apiToken: nc.apiToken },
  })
  const waTriggerCred = await upsertCredential(auth, {
    name: 'WhatsApp Trigger (local dev)',
    type: 'whatsAppTriggerApi',
    data: { clientId: 'ilot-local-dev', clientSecret: WHATSAPP_CLIENT_SECRET },
  })
  console.log(`credentials ready: ${nocoCred.name}, ${waTriggerCred.name}`)

  // Which local table each NocoDB node should point at, by node name.
  const TABLE_FOR_NODE = {
    'Fetch active FAQs': nc.tables.FAQs,
    'Create lead in NocoDB': nc.tables.Clients,
  }

  const { json: wfList } = await req(`${N8N_URL}/rest/workflows`, { headers: auth })
  for (const summary of wfList.data || wfList) {
    const { json: wrapped } = await req(`${N8N_URL}/rest/workflows/${summary.id}`, { headers: auth })
    const wf = wrapped.data || wrapped
    const changes = []

    const nodes = wf.nodes.map((node) => {
      if (node.type === 'n8n-nodes-base.nocoDb') {
        const table = TABLE_FOR_NODE[node.name]
        if (!table) {
          changes.push(`! ${node.name}: no local table mapped — left alone`)
          return node
        }
        changes.push(`${node.name}: table -> ${table}`)
        return {
          ...node,
          parameters: { ...node.parameters, workspaceId: '', projectId: nc.baseId, table },
          credentials: { nocoDbApiToken: nocoCred },
        }
      }

      if (node.type === 'n8n-nodes-base.whatsAppTrigger') {
        changes.push(`${node.name}: local trigger credential`)
        return { ...node, credentials: { whatsAppTriggerApi: waTriggerCred } }
      }

      // Local compatibility fix, not a workflow change.
      //
      // On n8n 2.19.5 the in-memory vector store declares `prompt` as required
      // whenever mode = load, so the repo snapshot refuses to publish:
      //   Node "Simple Vector Store (read)":
      //     - Missing or invalid required parameters: prompt
      // The node is wired as a sub-node of the ILOT Knowledge Base tool, which
      // supplies the query at run time, so the value here is never read. It only
      // has to be non-empty to satisfy validation.
      //
      // Whether production hits this depends on the n8n version it runs — see
      // the pin note in docker-compose.dev.yml. Confirm before assuming the
      // snapshot is broken in production too.
      if (
        node.type === '@n8n/n8n-nodes-langchain.vectorStoreInMemory' &&
        node.parameters?.mode === 'load' &&
        !node.parameters?.prompt
      ) {
        changes.push(`${node.name}: added required "prompt" (load mode, n8n 2.19.5)`)
        return { ...node, parameters: { ...node.parameters, prompt: 'ILOT knowledge base query' } }
      }

      if (node.type === 'n8n-nodes-base.whatsApp') {
        changes.push(`${node.name}: -> HTTP Request to webhook-catcher`)
        return toCatcherNode(node)
      }

      return node
    })

    if (changes.length === 0) {
      console.log(`\n${wf.name}: nothing to patch`)
      continue
    }

    await req(`${N8N_URL}/rest/workflows/${wf.id}`, {
      method: 'PATCH',
      headers: auth,
      body: { versionId: wf.versionId, nodes, connections: wf.connections },
    })
    console.log(`\n${wf.name} (${wf.id})`)
    for (const c of changes) console.log(`  ${c}`)
  }

  console.log(`
Patched the DRAFT of each workflow. n8n runs activeVersion, not the draft, so an
activated workflow keeps running its old published snapshot until you publish.
Manual executions do use the draft.`)
}

main().catch((err) => {
  console.error(`\npatch failed: ${err.message}`)
  process.exit(1)
})
