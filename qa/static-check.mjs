import { readdir, readFile, stat } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import { spawn } from 'node:child_process'

const root = resolve(process.cwd())
const ignored = new Set(['node_modules', '.git', 'dist', 'build', 'qa/reports'])
const files = []
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    const rel = relative(root, full).replaceAll('\\', '/')
    if ([...ignored].some(x => rel === x || rel.startsWith(`${x}/`))) continue
    if (entry.isDirectory()) await walk(full)
    else if (entry.isFile() && full.endsWith('.js')) files.push(full)
  }
}
await walk(root)

let failures = 0
function result(ok, msg) { console.log(`${ok ? '✓' : '✗'} ${msg}`); if (!ok) failures++ }

for (const file of files) {
  const code = await new Promise(resolvePromise => {
    const p = spawn(process.execPath, ['--check', file], { stdio: ['ignore', 'pipe', 'pipe'] })
    let stderr = ''
    p.stderr.on('data', d => { stderr += d })
    p.on('close', code => resolvePromise({ code, stderr }))
  })
  result(code.code === 0, `Sintaxe JS: ${relative(root, file)}${code.code ? ` -> ${code.stderr.trim().split('\n').at(-1)}` : ''}`)
}

const required = [
  'packages/database/prisma/schema.prisma',
  'packages/database/prisma/migrations/20260920200000_delivery_pro_features/migration.sql',
  'cliente/backend/src/middlewares/tenant.js',
  'painel/backend/src/middlewares/tenant.js',
  'cliente/backend/src/services/pagamentos.js',
  'painel/backend/src/services/whatsapp.js',
]
for (const rel of required) {
  try { await stat(join(root, rel)); result(true, `Arquivo obrigatório: ${rel}`) }
  catch { result(false, `Arquivo obrigatório ausente: ${rel}`) }
}

const schema = await readFile(join(root, 'packages/database/prisma/schema.prisma'), 'utf8')
for (const token of ['model Estabelecimento', 'model Pagamento', 'model EstoqueMovimento', 'model Fidelidade', 'model Avaliacao', 'estabelecimentoId']) {
  result(schema.includes(token), `Schema contém: ${token}`)
}

console.log(`\nStatic QA: ${failures ? 'FAIL' : 'PASS'} (${failures} falhas)`)
if (failures) process.exitCode = 1
