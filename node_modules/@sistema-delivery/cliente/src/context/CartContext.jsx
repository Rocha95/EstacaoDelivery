import { createContext, useContext, useMemo, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [itens, setItens] = useState([])
  const [cupom, setCupom] = useState(null)
  const [modoEntrega, setModoEntrega] = useState(null)
  const [enderecoSelecionado, setEnderecoSelecionado] = useState(null)
  const [pagamento, setPagamento] = useState(null)

  const adicionarItem = (produto, adicionaisSelecionados = [], quantidade = 1) => {
    const precoBase = Number(produto.preco) || 0
    const precoAdicionais = adicionaisSelecionados.reduce((s, a) => s + (Number(a.preco) || 0), 0)

    setItens((prev) => [
      ...prev,
      {
        chave: `${produto.id}-${Date.now()}-${Math.random()}`,
        produtoId: produto.id,
        nome: produto.nome,
        emoji: produto.emoji,
        imagemUrl: produto.imagemUrl,
        precoUnitario: precoBase + precoAdicionais,
        adicionais: adicionaisSelecionados.map((a) => ({
          opcaoId: a.opcaoId,
          nome: a.nome,
          preco: Number(a.preco) || 0,
        })),
        quantidade: Math.max(1, Number(quantidade) || 1),
      },
    ])
  }

  const adicionarCombo = (combo, quantidade = 1) => {
    const precoBase = Number(combo.preco) || 0

    setItens((prev) => [
      ...prev,
      {
        chave: `combo-${combo.id}-${Date.now()}-${Math.random()}`,
        comboId: combo.id,
        nome: combo.nome,
        emoji: combo.emoji,
        imagemUrl: combo.imagemUrl,
        precoUnitario: precoBase,
        adicionais: [],
        quantidade: Math.max(1, Number(quantidade) || 1),
      },
    ])
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
    () => itens.reduce((s, i) => s + Number(i.precoUnitario || 0) * Number(i.quantidade || 0), 0),
    [itens]
  )

  const quantidadeTotal = useMemo(
    () => itens.reduce((s, i) => s + Number(i.quantidade || 0), 0),
    [itens]
  )

  return (
    <CartContext.Provider
      value={{
        itens, adicionarItem, adicionarCombo, alterarQuantidade, removerItem, limparCarrinho,
        subtotal, quantidadeTotal, cupom, setCupom, modoEntrega, setModoEntrega,
        enderecoSelecionado, setEnderecoSelecionado, pagamento, setPagamento,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart precisa estar dentro de <CartProvider>')
  return ctx
}
