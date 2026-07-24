'use client'

import { ClientPluginSlot } from '@/components/ClientPluginSlot'
import { useEffect, useRef, useCallback } from 'react'
import { useCart } from '@/hooks/use-cart'
import Image from 'next/image'
import Link from 'next/link'
import { X, ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react'
import { getProductImage } from '@/lib/utils/placeholder-images'
import { formatPrice } from '@/lib/utils/format-price'
import { PromoCodeInput } from '@/components/checkout/promo-code-input'
import type { CartLineItem } from '@/types'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const {
    cart, removeItem, updateItem, itemCount, subtotal, isLoading,
    appliedPromoCodes, discountTotal, applyPromoCode, removePromoCode,
    isApplyingPromo, isRemovingPromo,
  } = useCart()

  const drawerRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Focus the close button when drawer opens
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus()
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Trap focus inside drawer
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !drawerRef.current) return

    const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }, [])

  if (!isOpen) return null

  const currencyCode = cart?.currency_code || cart?.region?.currency_code || 'usd'
  const formattedSubtotal = formatPrice(subtotal || 0, currencyCode)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        onKeyDown={handleKeyDown}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl z-50 flex flex-col animate-slide-in-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-5">
          <h2 className="font-heading text-xl font-semibold">
            Bag ({itemCount})
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 -mr-2 hover:opacity-70 transition-opacity"
            aria-label="Close bag"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="h-24 w-20 rounded bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded bg-muted" />
                    <div className="h-3 w-1/3 rounded bg-muted" />
                    <div className="h-4 w-1/4 rounded bg-muted mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : !cart?.items || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/40" strokeWidth={1.5} />
              <p className="mt-4 text-muted-foreground">Your bag is empty</p>
              <button
                onClick={onClose}
                className="mt-6 text-sm font-semibold uppercase tracking-wide link-underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.items.map((item: CartLineItem) => {
                const price = item.unit_price
                const formattedPrice = formatPrice(price, currencyCode)

                return (
                  <div key={item.id} className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative h-28 w-22 flex-shrink-0 overflow-hidden rounded bg-muted">
                      <Image
                        src={getProductImage(item.thumbnail, item.product_id || item.id)}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-1 flex-col min-w-0">
                      <div className="flex justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-medium text-sm truncate">{item.title}</h3>
                          {item.variant?.title && item.variant.title !== 'Default' && (
                            <p className="text-xs text-muted-foreground mt-0.5">{item.variant.title}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-auto pt-2 flex items-center justify-between">
                        {/* Quantity Selector */}
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => updateItem({ lineId: item.id, quantity: Math.max(1, item.quantity - 1) })}
                            className="p-2.5 hover:bg-muted transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-3 text-sm font-medium tabular-nums">{item.quantity}</span>
                          <button
                            onClick={() => updateItem({ lineId: item.id, quantity: item.quantity + 1 })}
                            className="p-2.5 hover:bg-muted transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <p className="text-sm font-medium">
                          {item.quantity > 1 ? (
                            <span>{formattedPrice} × {item.quantity}</span>
                          ) : (
                            formattedPrice
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart?.items && cart.items.length > 0 && (
          <div className="border-t px-6 py-5 space-y-4">
            <PromoCodeInput
              appliedPromoCodes={appliedPromoCodes}
              discountTotal={discountTotal}
              currencyCode={currencyCode}
              isApplyingPromo={isApplyingPromo}
              isRemovingPromo={isRemovingPromo}
              onApply={applyPromoCode}
              onRemove={removePromoCode}
            />
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-baseline">
                <span className="text-sm uppercase tracking-wide">Subtotal</span>
                <span className="text-lg font-heading font-semibold">{formattedSubtotal}</span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-sm text-green-700 dark:text-green-500">
                  <span>Discount</span>
                  <span>-{formatPrice(discountTotal, currencyCode)}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Shipping and taxes calculated at checkout
            </p>
            <ClientPluginSlot name="cartDrawerFooter" context={{ cartId: cart?.id }} />
            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full bg-foreground text-background text-center py-3.5 text-sm font-semibold uppercase tracking-wide hover:opacity-90 transition-opacity"
            >
              Checkout
            </Link>
            <button
              onClick={onClose}
              className="block w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
