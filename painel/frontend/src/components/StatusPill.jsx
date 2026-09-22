const STATUS_LABEL = {
  AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
  RECEBIDO: 'Recebido',
  EM_PRODUCAO: 'Em produção',
  SAIU_PARA_ENTREGA: 'Saiu para entrega',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
}

const STATUS_PILL_CLASS = {
  AGUARDANDO_PAGAMENTO: 'pill-mustard',
  RECEBIDO: 'pill-muted',
  EM_PRODUCAO: 'pill-mustard',
  SAIU_PARA_ENTREGA: 'pill-sky',
  FINALIZADO: 'pill-basil',
  CANCELADO: 'pill-danger',
}

export default function StatusPill({ status }) {
  const key = String(status || '').toUpperCase()
  return <span className={`pill ${STATUS_PILL_CLASS[key] || 'pill-muted'}`}>{STATUS_LABEL[key] || key || 'Sem status'}</span>
}
