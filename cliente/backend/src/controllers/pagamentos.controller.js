import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { consultarPagamentoMercadoPago } from '../services/pagamentos.js'

function mapStatus(status){return ({approved:'APROVADO',rejected:'REJEITADO',cancelled:'CANCELADO',expired:'EXPIRADO',pending:'PENDENTE',in_process:'PENDENTE'})[status]||'PENDENTE'}
export async function consultar(req,res){
  const pedido=await prisma.pedido.findFirst({where:{id:req.params.pedidoId,clienteId:req.usuario.id,estabelecimentoId:req.estabelecimentoId},include:{pagamento:true}})
  if(!pedido)throw new ApiError(404,'Pedido não encontrado.')
  if(!pedido.pagamento)return res.json({status:pedido.pagamentoStatus})
  if(pedido.pagamento.provedor==='MERCADO_PAGO'&&pedido.pagamento.externoId){
    const mp=await consultarPagamentoMercadoPago(pedido.pagamento.externoId)
    const status=mapStatus(mp.status)
    if(status!==pedido.pagamento.status){await prisma.pagamento.update({where:{id:pedido.pagamento.id},data:{status}});await prisma.pedido.update({where:{id:pedido.id},data:{pagamentoStatus:status}})}
    return res.json({...pedido.pagamento,status})
  }
  res.json(pedido.pagamento)
}

export async function webhook(req,res){
  // O Mercado Pago recomenda webhook HTTPS. Para confirmar o estado, consultamos o recurso pelo ID.
  const data=req.body||{}
  const id=data?.data?.id||data?.id
  if(id&&process.env.MP_ACCESS_TOKEN){
    try{const mp=await consultarPagamentoMercadoPago(String(id));const pedidoId=mp.external_reference;if(pedidoId){const pagamento=await prisma.pagamento.findFirst({where:{externoId:String(id)}});if(pagamento){const status=mapStatus(mp.status);await prisma.$transaction([prisma.pagamento.update({where:{id:pagamento.id},data:{status}}),prisma.pedido.update({where:{id:pagamento.pedidoId},data:{pagamentoStatus:status}})])}}}catch(err){console.error('Webhook Mercado Pago:',err.message)}
  }
  res.status(200).json({ok:true})
}
