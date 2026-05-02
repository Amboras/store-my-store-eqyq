'use client'

import { useState } from 'react'
import { Loader2, Check, Package } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/hooks/use-cart'

interface BundleOfferProps {
  variantId: string | null
  unitPrice: number | null
  currency: string
  productTitle: string
}

const BUNDLES = [
  { qty: 1, discount: 0, label: '1× Pack', tag: null },
  { qty: 2, discount: 10, label: '2× Pack', tag: 'Most popular', highlight: true },
  { qty: 3, discount: 20, label: '3× Pack', tag: 'Best value' },
]

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

export default function BundleOffer({ variantId, unitPrice, currency, productTitle }: BundleOfferProps) {
  const [selected, setSelected] = useState(2)
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

  const selectedBundle = BUNDLES.find((b) => b.qty === selected)!
  const selectedSubtotal = unitPrice * selectedBundle.qty
  const selectedTotal = Math.round(selectedSubtotal * (1 - selectedBundle.discount / 100))

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#C9261A]/10">
            <Package className="h-3.5 w-3.5 text-[#C9261A]" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#3A0F08] leading-tight">Bundle &amp; Save</h2>
            <p className="text-[11px] text-[#7A1F12]/70 leading-tight">Buy more, save more</p>
          </div>
        </div>
        {selectedBundle.discount > 0 && (
          <div className="rounded-full bg-[#C9261A] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1">
            Save {selectedBundle.discount}%
          </div>
        )}
      </div>

      {/* Bundle options — vertical list */}
      <div className="space-y-2">
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
              className={`relative w-full text-left rounded-xl border-2 px-4 py-3 transition-all flex items-center gap-3 ${
                isSelected
                  ? 'border-[#C9261A] bg-gradient-to-r from-[#FFF5EE] to-white shadow-sm'
                  : 'border-[#C9261A]/15 bg-white hover:border-[#C9261A]/40'
              }`}
            >
              {/* Radio */}
              <div
                className={`flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected ? 'border-[#C9261A] bg-[#C9261A]' : 'border-[#C9261A]/30 bg-white'
                }`}
              >
                {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
              </div>

              {/* Label + per-unit */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-[#3A0F08]">{bundle.label}</span>
                  {bundle.tag && (
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        bundle.highlight
                          ? 'bg-[#C9261A] text-white'
                          : 'bg-[#C9261A]/10 text-[#C9261A]'
                      }`}
                    >
                      {bundle.tag}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#7A1F12]/70 mt-0.5">
                  {formatPrice(perUnit, currency)} / unit
                  {bundle.discount > 0 && (
                    <span className="ml-1.5 text-[#C9261A] font-semibold">· Save {bundle.discount}%</span>
                  )}
                </p>
              </div>

              {/* Price */}
              <div className="flex-shrink-0 text-right">
                <div className="text-sm font-bold text-[#3A0F08] tabular-nums">
                  {formatPrice(discounted, currency)}
                </div>
                {bundle.discount > 0 && (
                  <div className="text-[11px] text-[#7A1F12]/50 line-through tabular-nums">
                    {formatPrice(subtotal, currency)}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Summary + CTA */}
      <div className="mt-4 pt-4 border-t border-[#C9261A]/10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-[#7A1F12]/70">Total</span>
          <div className="flex items-baseline gap-2">
            {selectedBundle.discount > 0 && (
              <span className="text-xs text-[#7A1F12]/50 line-through tabular-nums">
                {formatPrice(selectedSubtotal, currency)}
              </span>
            )}
            <span className="text-xl font-bold text-[#C9261A] tabular-nums">
              {formatPrice(selectedTotal, currency)}
            </span>
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={adding}
          className={`w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] ${
            justAdded
              ? 'bg-green-700 text-white'
              : 'bg-gradient-to-r from-[#FF5A3C] to-[#C9261A] text-white hover:from-[#FF6B4F] hover:to-[#D9302A]'
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
            <>Add {selectedBundle.label} to Bag</>
          )}
        </button>
      </div>
    </div>
  )
}
