import { prisma } from '../lib/prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { consultarPagamentoMercadoPago } from '../services/pagamentos.js'
import { notificarPedido } from '../services/whatsapp.js'

function mapStatus(status){return ({approved:'APROVADO',rejected:'REJEITADO',cancelled:'CANCELADO',expired:'EXPIRADO',pending:'PENDENTE',in_process:'PENDENTE'})[status]||'PENDENTE'}
export async function consultar(req,res){
  const pedido=await prisma.pedido.findFirst({where:{id:req.params.pedidoId,clienteId:req.usuario.id,estabelecimentoId:req.estabelecimentoId},include:{pagamento:true}})
  if(!pedido)throw new ApiError(404,'Pedido não encontrado.')
  if(!pedido.pagamento)return res.json({status:pedido.pagamentoStatus,pedidoStatus:pedido.status})
  if(pedido.pagamento.provedor==='MERCADO_PAGO'&&pedido.pagamento.externoId){
    const mp=await consultarPagamentoMercadoPago(pedido.pagamento.externoId)
    const status=mapStatus(mp.status)
    if(status!==pedido.pagamento.status){
      await prisma.pagamento.update({where:{id:pedido.pagamento.id},data:{status}})
      const dadosPedido = status==='APROVADO' && pedido.status==='AGUARDANDO_PAGAMENTO' ? {pagamentoStatus:status,status:'RECEBIDO'} : {pagamentoStatus:status}
      await prisma.pedido.update({where:{id:pedido.id},data:dadosPedido})
      if(dadosPedido.status==='RECEBIDO') notificarPedido({pedido:{...pedido,status:'RECEBIDO',pagamentoStatus:status},evento:'RECEBIDO'}).catch(()=>{})
    }
    const atualizado=await prisma.pagamento.findUnique({where:{id:pedido.pagamento.id}})
    const pedidoAtualizado=await prisma.pedido.findUnique({where:{id:pedido.id},select:{status:true,pagamentoStatus:true}})
    return res.json({...atualizado,pedidoStatus:pedidoAtualizado.status,pagamentoStatus:pedidoAtualizado.pagamentoStatus})
  }
  res.json({...pedido.pagamento,pedidoStatus:pedido.status,pagamentoStatus:pedido.pagamentoStatus})
}

export async function webhook(req,res){
  const data=req.body||{}
  const id=data?.data?.id||data?.id
  if(id&&process.env.MP_ACCESS_TOKEN){
    try{
      const mp=await consultarPagamentoMercadoPago(String(id))
      const pagamento=await prisma.pagamento.findFirst({where:{externoId:String(id)},include:{pedido:true}})
      if(pagamento){
        const status=mapStatus(mp.status)
        const pedidoData = status==='APROVADO' && pagamento.pedido.status==='AGUARDANDO_PAGAMENTO'
          ? {pagamentoStatus:status,status:'RECEBIDO'}
          : {pagamentoStatus:status}
        await prisma.$transaction([
          prisma.pagamento.update({where:{id:pagamento.id},data:{status}}),
          prisma.pedido.update({where:{id:pagamento.pedidoId},data:pedidoData}),
        ])
        if(pedidoData.status==='RECEBIDO') notificarPedido({pedido:{...pagamento.pedido,status:'RECEBIDO',pagamentoStatus:status},evento:'RECEBIDO'}).catch(()=>{})
      }
    }catch(err){console.error('Webhook Mercado Pago:',err.message)}
  }
  res.status(200).json({ok:true})
}
