import { createContext, useContext, useMemo, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [itens, setItens] = useState([])
  const [cupom, setCupom] = useState(null)
  const [modoEntrega, setModoEntrega] = useState(null) // 'delivery' | 'retirada'
  const [enderecoSelecionado, setEnderecoSelecionado] = useState(null)
  const [pagamento, setPagamento] = useState(null) // 'pix' | 'entrega'

  const adicionarItem = (produto, adicionaisSelecionados = [], quantidade = 1) => {
    // Garante que o preço base do produto seja Number
    const precoBase = Number(produto.preco) || 0

    // Soma o preço dos adicionais garantindo conversão numérica
    const precoAdicionais = adicionaisSelecionados.reduce(
      (s, a) => s + (Number(a.preco) || 0),
      0
    )

    const item = {
      chave: `${produto.id}-${Date.now()}`,
      produtoId: produto.id,
      nome: produto.nome,
      emoji: produto.emoji,
      precoUnitario: precoBase + precoAdicionais,
      adicionais: adicionaisSelecionados,
      quantidade: Number(quantidade) || 1,
    }

    setItens((prev) => [...prev, item])
  }

  const alterarQuantidade = (chave, delta) => {
    setItens((prev) =>
      prev
        .map((i) => (i.chave === chave ? { ...i, quantidade: i.quantidade + delta } : i))
        .filter((i) => i.quantidade > 0)
    )
  }

  const removerItem = (chave) => setItens((prev) => prev.filter((i) => i.chave !== chave))

  const limparCarrinho = () => {
    setItens([])
    setCupom(null)
    setModoEntrega(null)
    setEnderecoSelecionado(null)
    setPagamento(null)
  }

  const subtotal = useMemo(
    () =>
      itens.reduce(
        (s, i) => s + (Number(i.precoUnitario) || 0) * (Number(i.quantidade) || 0),
        0
      ),
    [itens]
  )

  const quantidadeTotal = useMemo(
    () => itens.reduce((s, i) => s + (Number(i.quantidade) || 0), 0),
    [itens]
  )

  const value = {
    itens,
    adicionarItem,
    alterarQuantidade,
    removerItem,
    limparCarrinho,
    subtotal,
    quantidadeTotal,
    cupom,
    setCupom,
    modoEntrega,
    setModoEntrega,
    enderecoSelecionado,
    setEnderecoSelecionado,
    pagamento,
    setPagamento,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart precisa estar dentro de <CartProvider>')
  return ctx
}