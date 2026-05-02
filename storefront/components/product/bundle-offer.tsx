'use client'

import { useState } from 'react'
import { Loader2, Check, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/hooks/use-cart'

interface BundleOfferProps {
  variantId: string | null
  unitPrice: number | null
  currency: string
  productTitle: string
}

const BUNDLES = [
  { qty: 1, discount: 0, label: 'Single', note: 'Try it out' },
  { qty: 2, discount: 10, label: 'Double Up', note: 'Most popular', highlight: true },
  { qty: 3, discount: 20, label: 'Stock Up', note: 'Best value' },
]

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

export default function BundleOffer({ variantId, unitPrice, currency, productTitle }: BundleOfferProps) {
  const [selected, setSelected] = useState(1)
  const [adding, setAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const { addItem } = useCart()

  if (!variantId || unitPrice == null) return null

  const handleAdd = () => {
    const bundle = BUNDLES.find((b) => b.qty === selected)
    if (!bundle) return

    setAdding(true)
    addItem(
      { variantId, quantity: bundle.qty },
      {
        onSuccess: () => {
          setAdding(false)
          setJustAdded(true)
          toast.success(`${bundle.qty}× ${productTitle} added to bag`)
          setTimeout(() => setJustAdded(false), 2000)
        },
        onError: (err: Error) => {
          setAdding(false)
          toast.error(err.message || 'Failed to add bundle')
        },
      },
    )
  }

  return (
    <div className="border-y py-8 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-4 w-4 text-accent" strokeWidth={1.8} />
        <h2 className="text-xs uppercase tracking-[0.18em] font-semibold">Bundle &amp; Save</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Buy more, save more. Free shipping on every bundle.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {BUNDLES.map((bundle) => {
          const subtotal = unitPrice * bundle.qty
          const discounted = Math.round(subtotal * (1 - bundle.discount / 100))
          const perUnit = discounted / bundle.qty
          const isSelected = selected === bundle.qty

          return (
            <button
              key={bundle.qty}
              onClick={() => setSelected(bundle.qty)}
              type="button"
              className={`relative text-left rounded-sm border-2 p-4 transition-all ${
                isSelected
                  ? 'border-foreground bg-foreground/[0.03] shadow-sm'
                  : 'border-border hover:border-foreground/40'
              }`}
            >
              {bundle.highlight && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                  {bundle.note}
                </span>
              )}

              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold">{bundle.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {bundle.qty} {bundle.qty === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <div
                  className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'border-foreground bg-foreground' : 'border-border'
                  }`}
                >
                  {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-background" />}
                </div>
              </div>

              {bundle.discount > 0 && (
                <div className="inline-block bg-accent/10 text-accent text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-sm mb-2">
                  Save {bundle.discount}%
                </div>
              )}

              <div className="space-y-0.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-semibold">{formatPrice(discounted, currency)}</span>
                  {bundle.discount > 0 && (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(subtotal, currency)}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {formatPrice(perUnit, currency)} / unit
                </p>
              </div>
            </button>
          )
        })}
      </div>

      <button
        onClick={handleAdd}
        disabled={adding}
        className={`mt-5 w-full py-3.5 text-sm font-semibold uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${
          justAdded ? 'bg-green-700 text-white' : 'bg-foreground text-background hover:opacity-90'
        }`}
      >
        {adding ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : justAdded ? (
          <>
            <Check className="h-4 w-4" />
            Bundle added
          </>
        ) : (
          `Add ${selected}-Pack to Bag`
        )}
      </button>
    </div>
  )
}
