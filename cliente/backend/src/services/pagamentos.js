import crypto from 'node:crypto'
const MP_URL = 'https://api.mercadopago.com/v1/payments'
export async function criarPixMercadoPago({ pedido, cliente }) {
  const token = process.env.MP_ACCESS_TOKEN
  if (!token) throw new Error('Mercado Pago não configurado. Defina MP_ACCESS_TOKEN no backend do cliente.')
  if (!cliente?.email) throw new Error('Cadastre um e-mail para pagar com Pix online.')
  const response = await fetch(MP_URL,{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json',Authorization:`Bearer ${token}`,'X-Idempotency-Key':crypto.randomUUID()},body:JSON.stringify({transaction_amount:Number(pedido.total),description:`Pedido #${pedido.numero}`,payment_method_id:'pix',external_reference:pedido.id,notification_url:process.env.MP_WEBHOOK_URL||undefined,payer:{email:cliente.email,first_name:cliente.nome}})})
  const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data?.message||data?.cause?.[0]?.description||'Mercado Pago recusou a criação do pagamento.')
  return {provedor:'MERCADO_PAGO',externoId:String(data.id),status:data.status==='approved'?'APROVADO':'PENDENTE',valor:Number(pedido.total),qrCode:data.point_of_interaction?.transaction_data?.qr_code||null,qrCodeBase64:data.point_of_interaction?.transaction_data?.qr_code_base64||null,copiaECola:data.point_of_interaction?.transaction_data?.qr_code||null,ticketUrl:data.point_of_interaction?.transaction_data?.ticket_url||null}
}
export async function consultarPagamentoMercadoPago(externoId){const token=process.env.MP_ACCESS_TOKEN;if(!token)throw new Error('Mercado Pago não configurado.');const response=await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(externoId)}`,{headers:{Authorization:`Bearer ${token}`}});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data?.message||'Não foi possível consultar o pagamento.');return data}
