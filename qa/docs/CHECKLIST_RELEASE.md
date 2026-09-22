# Checklist de release

## Código
- [ ] revisão concluída
- [ ] sem `console.log` sensível
- [ ] sem secrets no frontend
- [ ] sem credenciais hardcoded
- [ ] tratamento de erros consistente

## Banco
- [ ] migration revisada
- [ ] backup/homologação testado
- [ ] rollback planejado
- [ ] índices/constraints revisados
- [ ] isolamento tenant verificado

## Backend
- [ ] static QA
- [ ] smoke
- [ ] API regressão
- [ ] autenticação
- [ ] autorização/IDOR
- [ ] validação de payload
- [ ] estoque concorrente
- [ ] pagamento
- [ ] webhook
- [ ] WhatsApp

## Frontend
- [ ] build Cliente
- [ ] build Painel
- [ ] console sem erro
- [ ] loading/erro/vazio
- [ ] mobile
- [ ] desktop
- [ ] acessibilidade básica

## Negócio
- [ ] pedido
- [ ] taxa
- [ ] cupom
- [ ] horário
- [ ] estoque
- [ ] KDS
- [ ] cancelamento
- [ ] fidelidade
- [ ] avaliação
- [ ] multi-tenant

## Go/No-Go
- [ ] nenhum P0
- [ ] nenhum P1 aberto sem aceite formal
- [ ] evidências arquivadas
- [ ] versão identificada
- [ ] plano de rollback conhecido
