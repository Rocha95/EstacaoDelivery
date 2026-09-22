import crypto from 'node:crypto'
import QRCode from 'qrcode'

const MP_URL = 'https://api.mercadopago.com/v1/payments'

function campo(id, valor) {
  const texto = String(valor ?? '')
  return `${id}${String(texto.length).padStart(2, '0')}${texto}`
}

function crc16(payload) {
  let crc = 0xFFFF
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

function normalizarTextoPix(valor, limite) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, limite) || 'ESTABELECIMENTO'
}

export function gerarPayloadPix({ chavePix, valor, nomeEstabelecimento, cidade, txid }) {
  if (!chavePix) throw new Error('O estabelecimento ainda não cadastrou uma chave Pix.')
  const valorNumerico = Number(valor)
  if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) throw new Error('Valor inválido para geração do Pix.')

  const merchantAccount = campo('00', 'BR.GOV.BCB.PIX') + campo('01', String(chavePix).trim())
  const adicional = campo('05', String(txid || '***').replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || '***')
  const semCrc = [
    campo('00', '01'),
    campo('26', merchantAccount),
    campo('52', '0000'),
    campo('53', '986'),
    campo('54', valorNumerico.toFixed(2)),
    campo('58', 'BR'),
    campo('59', normalizarTextoPix(nomeEstabelecimento, 25)),
    campo('60', normalizarTextoPix(cidade, 15)),
    campo('62', adicional),
    '6304',
  ].join('')
  return `${semCrc}${crc16(semCrc)}`
}

export async function criarPixManual({ pedido, config }) {
  if (!config?.chavePix) throw new Error('O estabelecimento ainda não cadastrou uma chave Pix.')
  const copiaECola = gerarPayloadPix({
    chavePix: config.chavePix,
    valor: pedido.total,
    nomeEstabelecimento: config.nomeEstabelecimento,
    cidade: config.enderecoCidade || 'BRASIL',
    txid: pedido.numero,
  })
  const qrCodeBase64 = await QRCode.toDataURL(copiaECola, { width: 360, margin: 2 })
  return {
    provedor: 'MANUAL',
    status: 'PENDENTE',
    valor: Number(pedido.total),
    qrCode: copiaECola,
    qrCodeBase64: qrCodeBase64.replace(/^data:image\/png;base64,/, ''),
    copiaECola,
    ticketUrl: null,
    expiraEm: new Date(Date.now() + 10 * 60 * 1000),
  }
}

export async function criarPixMercadoPago({ pedido, cliente }) {
  const token = process.env.MP_ACCESS_TOKEN
  if (!token) throw new Error('Mercado Pago não configurado. Defina MP_ACCESS_TOKEN no backend do cliente.')
  if (!cliente?.email) throw new Error('Cadastre um e-mail para pagar com Pix online.')
  const response = await fetch(MP_URL,{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json',Authorization:`Bearer ${token}`,'X-Idempotency-Key':crypto.randomUUID()},body:JSON.stringify({transaction_amount:Number(pedido.total),description:`Pedido #${pedido.numero}`,payment_method_id:'pix',external_reference:pedido.id,notification_url:process.env.MP_WEBHOOK_URL||undefined,payer:{email:cliente.email,first_name:cliente.nome}})})
  const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data?.message||data?.cause?.[0]?.description||'Mercado Pago recusou a criação do pagamento.')
  return {provedor:'MERCADO_PAGO',externoId:String(data.id),status:data.status==='approved'?'APROVADO':'PENDENTE',valor:Number(pedido.total),qrCode:data.point_of_interaction?.transaction_data?.qr_code||null,qrCodeBase64:data.point_of_interaction?.transaction_data?.qr_code_base64||null,copiaECola:data.point_of_interaction?.transaction_data?.qr_code||null,ticketUrl:data.point_of_interaction?.transaction_data?.ticket_url||null,expiraEm:new Date(Date.now()+10*60*1000)}
}

export async function consultarPagamentoMercadoPago(externoId){const token=process.env.MP_ACCESS_TOKEN;if(!token)throw new Error('Mercado Pago não configurado.');const response=await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(externoId)}`,{headers:{Authorization:`Bearer ${token}`}});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data?.message||'Não foi possível consultar o pagamento.');return data}
