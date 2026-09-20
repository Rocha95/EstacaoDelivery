import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'

const CLIENT = process.env.QA_CLIENTE_URL || 'http://localhost:3334'
const PANEL = process.env.QA_PAINEL_URL || 'http://localhost:3333'
const TENANT = process.env.QA_ESTABELECIMENTO || 'default'
const TIMEOUT = Number(process.env.QA_TIMEOUT_MS || 10000)
const ALLOW_MUTATION = String(process.env.ALLOW_MUTATION || 'false').toLowerCase() === 'true'
const reportPath = resolve(process.cwd(), 'qa/reports/api-report.json')

const results = []
let sequence = 0

async function request(base, path, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT)
  const headers = { Accept: 'application/json', ...(options.headers || {}) }
  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json'
  try {
    const started = performance.now()
    const response = await fetch(`${base}${path}`, { ...options, headers, signal: controller.signal })
    const elapsed = Math.round(performance.now() - started)
    const text = await response.text()
    let body = text
    try { body = text ? JSON.parse(text) : null } catch {}
    return { ok: response.ok, status: response.status, body, elapsed, headers: response.headers }
  } finally { clearTimeout(timer) }
}

function add(id, title, status, details = {}) {
  results.push({ id, title, status, ...details })
  const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '○'
  console.log(`${icon} ${id} - ${title}${details.message ? ` | ${details.message}` : ''}`)
}

async function test(id, title, fn) {
  try {
    const value = await fn()
    add(id, title, value?.status || 'PASS', value)
  } catch (error) {
    add(id, title, 'FAIL', { message: error?.message || String(error), stack: error?.stack })
  }
}

function expectStatus(response, expected, context = '') {
  if (response.status !== expected) throw new Error(`${context} esperado HTTP ${expected}, recebido ${response.status}: ${JSON.stringify(response.body).slice(0, 600)}`)
}
function expectOneOf(response, statuses, context = '') {
  if (!statuses.includes(response.status)) throw new Error(`${context} esperado HTTP ${statuses.join('/')} recebido ${response.status}: ${JSON.stringify(response.body).slice(0, 600)}`)
}
function json(body) { return JSON.stringify(body) }

const clientHeaders = { 'X-Estabelecimento-Id': TENANT }
const panelHeaders = { 'X-Estabelecimento-Id': TENANT }

await test('INF-003', 'Health API Cliente', async () => {
  const r = await request(CLIENT, '/api/', { headers: clientHeaders })
  expectStatus(r, 200, 'Cliente health')
  if (!r.body?.ok) throw new Error('health não retornou ok=true')
  return { elapsed: r.elapsed }
})

await test('INF-002', 'Health API Painel', async () => {
  const r = await request(PANEL, '/api/', { headers: panelHeaders })
  expectStatus(r, 200, 'Painel health')
  if (!r.body?.ok) throw new Error('health não retornou ok=true')
  return { elapsed: r.elapsed }
})

for (const [id, path, title] of [
  ['CAT-001', '/api/categorias', 'Catálogo categorias'],
  ['CAT-002', '/api/produtos', 'Catálogo produtos'],
  ['CAT-007', '/api/combos', 'Catálogo combos'],
  ['INF-008', '/api/configuracao', 'Configuração pública'],
  ['INF-009', '/api/horarios', 'Horários públicos'],
]) {
  await test(id, title, async () => {
    const r = await request(CLIENT, path, { headers: clientHeaders })
    expectStatus(r, 200, path)
    if (!Array.isArray(r.body) && path !== '/api/configuracao') throw new Error('resposta não é array')
    return { elapsed: r.elapsed }
  })
}

await test('CLI-AUTH-009', 'Rotas autenticadas rejeitam ausência de token', async () => {
  const r = await request(CLIENT, '/api/auth/me', { headers: clientHeaders })
  expectStatus(r, 401, '/auth/me sem token')
})

await test('END-002', 'Endereços rejeitam ausência de token', async () => {
  const r = await request(CLIENT, '/api/enderecos', { headers: clientHeaders })
  expectStatus(r, 401, '/enderecos sem token')
})

await test('PED-001-AUTH', 'Pedidos rejeitam ausência de token', async () => {
  const r = await request(CLIENT, '/api/pedidos', { headers: clientHeaders })
  expectStatus(r, 401, '/pedidos sem token')
})

await test('FID-001-AUTH', 'Fidelidade rejeita ausência de token', async () => {
  const r = await request(CLIENT, '/api/fidelidade', { headers: clientHeaders })
  expectStatus(r, 401, '/fidelidade sem token')
})

await test('AVL-001-AUTH', 'Avaliações rejeitam ausência de token', async () => {
  const r = await request(CLIENT, '/api/avaliacoes/pedido/nao-existe', { headers: clientHeaders })
  expectStatus(r, 401, '/avaliacoes sem token')
})

await test('PAY-001-AUTH', 'Pagamento rejeita ausência de token', async () => {
  const r = await request(CLIENT, '/api/pagamentos/nao-existe', { headers: clientHeaders })
  expectStatus(r, 401, '/pagamentos sem token')
})

await test('SEC-008', 'Tenant inválido é rejeitado', async () => {
  const r = await request(CLIENT, '/api/produtos', { headers: { 'X-Estabelecimento-Id': '__tenant_inexistente__' } })
  expectOneOf(r, [400, 404], 'tenant inválido')
})

await test('PED-002', 'Payload de pedido vazio é rejeitado sem autenticação', async () => {
  const r = await request(CLIENT, '/api/pedidos', { method: 'POST', headers: clientHeaders, body: json({}) })
  expectStatus(r, 401, 'pedido sem token')
})

await test('PAY-007', 'Webhook inválido não derruba API', async () => {
  const r = await request(CLIENT, '/api/pagamentos/webhook', { method: 'POST', headers: clientHeaders, body: json({}) })
  expectOneOf(r, [200, 400, 404], 'webhook vazio')
})

for (const [id, path, title] of [
  ['ADM-001', '/api/categorias', 'Painel categorias'],
  ['ADM-003', '/api/produtos', 'Painel produtos'],
  ['ADM-008', '/api/combos', 'Painel combos'],
  ['KDS-001', '/api/cozinha', 'Painel cozinha'],
  ['EST-001', '/api/estoque', 'Painel estoque'],
  ['AVL-009', '/api/avaliacoes', 'Painel avaliações'],
  ['TEN-001', '/api/estabelecimentos', 'Painel estabelecimentos'],
]) {
  await test(id, title, async () => {
    const r = await request(PANEL, path, { headers: panelHeaders })
    expectStatus(r, 200, path)
    return { elapsed: r.elapsed }
  })
}

if (ALLOW_MUTATION) {
  const unique = `${Date.now()}_${sequence++}`
  const phone = `9${String(Date.now()).slice(-10)}`
  const email = `qa_${unique}@example.test`
  let token = null
  let user = null

  await test('CLI-AUTH-001', 'Cadastro de cliente de QA', async () => {
    const r = await request(CLIENT, '/api/auth/register', {
      method: 'POST', headers: clientHeaders,
      body: json({ nome: `QA ${unique}`, telefone: phone, email, senha: 'QaSenha123!' })
    })
    expectStatus(r, 201, 'cadastro')
    token = r.body?.token
    user = r.body?.usuario
    if (!token || !user?.id) throw new Error('cadastro não retornou token/usuário')
  })

  const authHeaders = { ...clientHeaders, Authorization: `Bearer ${token}` }

  await test('CLI-AUTH-006', 'Login de cliente de QA', async () => {
    const r = await request(CLIENT, '/api/auth/login', { method: 'POST', headers: clientHeaders, body: json({ telefone: phone, senha: 'QaSenha123!' }) })
    expectStatus(r, 200, 'login')
    if (!r.body?.token) throw new Error('login não retornou token')
  })

  await test('CLI-AUTH-007', 'Senha incorreta retorna 401', async () => {
    const r = await request(CLIENT, '/api/auth/login', { method: 'POST', headers: clientHeaders, body: json({ telefone: phone, senha: 'SenhaErrada999!' }) })
    expectStatus(r, 401, 'senha errada')
  })

  await test('CLI-AUTH-001-ME', 'Perfil autenticado', async () => {
    const r = await request(CLIENT, '/api/auth/me', { headers: authHeaders })
    expectStatus(r, 200, 'perfil')
    if (r.body?.id !== user.id) throw new Error('perfil diferente do usuário criado')
  })

  await test('END-003-VALIDATION', 'Endereço inválido é rejeitado', async () => {
    const r = await request(CLIENT, '/api/enderecos', { method: 'POST', headers: authHeaders, body: json({}) })
    expectStatus(r, 400, 'endereço inválido')
  })

  await test('FID-001', 'Consulta fidelidade autenticada', async () => {
    const r = await request(CLIENT, '/api/fidelidade', { headers: authHeaders })
    expectStatus(r, 200, 'fidelidade')
    if (typeof r.body?.pontosSaldo !== 'number') throw new Error('pontosSaldo ausente')
  })

  await test('FID-003', 'Histórico de fidelidade autenticado', async () => {
    const r = await request(CLIENT, '/api/fidelidade/historico', { headers: authHeaders })
    expectStatus(r, 200, 'histórico')
    if (!Array.isArray(r.body)) throw new Error('histórico não é array')
  })

  await test('PED-019', 'Lista de pedidos autenticada', async () => {
    const r = await request(CLIENT, '/api/pedidos', { headers: authHeaders })
    expectStatus(r, 200, 'meus pedidos')
    if (!Array.isArray(r.body)) throw new Error('pedidos não é array')
  })
}

const passed = results.filter(x => x.status === 'PASS').length
const failed = results.filter(x => x.status === 'FAIL').length
const skipped = results.filter(x => x.status === 'SKIP').length
const report = {
  generatedAt: new Date().toISOString(),
  environment: { client: CLIENT, panel: PANEL, tenant: TENANT, allowMutation: ALLOW_MUTATION },
  summary: { total: results.length, passed, failed, skipped },
  results,
}
await mkdir(dirname(reportPath), { recursive: true })
await writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8')
console.log(`\nRelatório: ${reportPath}`)
console.log(`TOTAL=${results.length} PASS=${passed} FAIL=${failed} SKIP=${skipped}`)
if (failed > 0) process.exitCode = 1
