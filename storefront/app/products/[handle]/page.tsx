import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const revalidate = 3600 // ISR: revalidate every hour
import { medusaServerClient } from '@/lib/medusa-client'
import Image from 'next/image'
import Link from 'next/link'
import { Truck, RotateCcw, Shield, ChevronRight, Star, Flame } from 'lucide-react'
import ProductActions from '@/components/product/product-actions'
import ProductAccordion from '@/components/product/product-accordion'
import { ProductViewTracker } from '@/components/product/product-view-tracker'
import BundleOffer from '@/components/product/bundle-offer'
import TrustBadges from '@/components/product/trust-badges'
import ProductReviews from '@/components/product/product-reviews'
import RelatedProducts from '@/components/product/related-products'
import { getProductPlaceholder } from '@/lib/utils/placeholder-images'
import { type VariantExtension } from '@/components/product/product-price'

async function getProduct(handle: string) {
  try {
    const regionsResponse = await medusaServerClient.store.region.list()
    const regionId = regionsResponse.regions[0]?.id
    if (!regionId) throw new Error('No region found')

    const response = await medusaServerClient.store.product.list({
      handle,
      region_id: regionId,
      fields: '*variants.calculated_price',
    })
    return response.products?.[0] || null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

async function getVariantExtensions(productId: string): Promise<Record<string, VariantExtension>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const storeId = process.env.NEXT_PUBLIC_STORE_ID
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    const headers: Record<string, string> = {}
    if (storeId) headers['X-Store-Environment-ID'] = storeId
    if (publishableKey) headers['x-publishable-api-key'] = publishableKey

    const res = await fetch(
      `${baseUrl}/store/product-extensions/products/${productId}/variants`,
      { headers, next: { revalidate: 30 } },
    )
    if (!res.ok) return {}

    const data = await res.json()
    const map: Record<string, VariantExtension> = {}
    for (const v of data.variants || []) {
      map[v.id] = {
        compare_at_price: v.compare_at_price,
        allow_backorder: v.allow_backorder ?? false,
        inventory_quantity: v.inventory_quantity,
      }
    }
    return map
  } catch {
    return {}
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const product = await getProduct(handle)

  if (!product) {
    return { title: 'Product Not Found' }
  }

  return {
    title: product.title,
    description: product.description || `Shop ${product.title}`,
    openGraph: {
      title: product.title,
      description: product.description || `Shop ${product.title}`,
      ...(product.thumbnail ? { images: [{ url: product.thumbnail }] } : {}),
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const product = await getProduct(handle)

  if (!product) {
    notFound()
  }

  const variantExtensions = await getVariantExtensions(product.id)

  const allImages = [
    ...(product.thumbnail ? [{ url: product.thumbnail }] : []),
    ...(product.images || []).filter((img: { url: string }) => img.url !== product.thumbnail),
  ]

  // Use placeholder if no images
  const displayImages = allImages.length > 0
    ? allImages
    : [{ url: getProductPlaceholder(product.id) }]

  const firstVariant = product.variants?.[0]
  const firstVariantPrice = firstVariant?.calculated_price?.calculated_amount ?? null
  const firstVariantCurrency = firstVariant?.calculated_price?.currency_code || 'usd'

  return (
    <div className="bg-floor-warm">
      {/* Breadcrumbs */}
      <div className="border-b border-[#C9261A]/10">
        <div className="container-custom py-3">
          <nav className="flex items-center gap-2 text-xs text-[#7A1F12]/70">
            <Link href="/" className="hover:text-[#C9261A] transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/products" className="hover:text-[#C9261A] transition-colors">Shop</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#C9261A] font-medium">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Product Images */}
          <div className="space-y-3">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-white/60 backdrop-blur-sm ring-1 ring-[#C9261A]/10 shadow-[0_20px_60px_-20px_rgba(201,38,26,0.35)]">
              {/* Hot badge */}
              <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-[#FF5A3C] to-[#C9261A] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 shadow-lg">
                <Flame className="h-3 w-3" strokeWidth={2.5} />
                Bestseller
              </div>
              <Image
                src={displayImages[0].url}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {displayImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {displayImages.slice(1, 5).map((image: { url: string }, idx: number) => (
                  <div
                    key={idx}
                    className="relative aspect-[3/4] overflow-hidden rounded-xl bg-white/60 backdrop-blur-sm ring-1 ring-[#C9261A]/10 hover:ring-[#C9261A]/40 transition-all"
                  >
                    <Image
                      src={image.url}
                      alt={`${product.title} ${idx + 2}`}
                      fill
                      sizes="12vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            {/* Title & Subtitle */}
            <div>
              {/* Floor brand pill */}
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/70 backdrop-blur-sm ring-1 ring-[#C9261A]/15 px-2.5 py-1 mb-3">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-[#FF5A3C] to-[#C9261A] text-white text-[9px] font-bold">F</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#C9261A]">Floor</span>
              </div>

              {product.subtitle && (
                <p className="text-sm uppercase tracking-[0.15em] text-[#7A1F12]/70 mb-2">
                  {product.subtitle}
                </p>
              )}
              <h1 className="text-h2 font-heading font-bold text-[#3A0F08] leading-tight">{product.title}</h1>

              {/* Inline rating */}
              <a
                href="#reviews"
                className="mt-3 inline-flex items-center gap-2 text-xs text-[#7A1F12]/80 hover:text-[#C9261A] transition-colors"
              >
                <span className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-[#FF5A3C] text-[#FF5A3C]"
                      strokeWidth={1.5}
                    />
                  ))}
                </span>
                <span className="font-medium">4.8 · 236 reviews</span>
              </a>
            </div>

            <ProductViewTracker
              productId={product.id}
              productTitle={product.title}
              variantId={product.variants?.[0]?.id || null}
              currency={product.variants?.[0]?.calculated_price?.currency_code || 'usd'}
              value={product.variants?.[0]?.calculated_price?.calculated_amount ?? null}
            />

            {/* Variant Selector + Price + Add to Cart (client component) */}
            <div className="rounded-2xl bg-white/70 backdrop-blur-sm ring-1 ring-[#C9261A]/10 p-5 shadow-sm">
              <ProductActions product={product} variantExtensions={variantExtensions} />
            </div>

            {/* Bundle & Save offer */}
            <div className="rounded-2xl bg-white/70 backdrop-blur-sm ring-1 ring-[#C9261A]/10 p-5 shadow-sm">
              <BundleOffer
                variantId={firstVariant?.id || null}
                unitPrice={firstVariantPrice}
                currency={firstVariantCurrency}
                productTitle={product.title}
              />
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-3 gap-4 py-6">
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 ring-1 ring-[#C9261A]/15">
                  <Truck className="h-4 w-4 text-[#C9261A]" strokeWidth={1.8} />
                </div>
                <p className="text-xs font-medium text-[#7A1F12]">Free Shipping</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 ring-1 ring-[#C9261A]/15">
                  <RotateCcw className="h-4 w-4 text-[#C9261A]" strokeWidth={1.8} />
                </div>
                <p className="text-xs font-medium text-[#7A1F12]">30-Day Returns</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 ring-1 ring-[#C9261A]/15">
                  <Shield className="h-4 w-4 text-[#C9261A]" strokeWidth={1.8} />
                </div>
                <p className="text-xs font-medium text-[#7A1F12]">Secure Checkout</p>
              </div>
            </div>

            {/* Accordion Sections */}
            <div className="rounded-2xl bg-white/70 backdrop-blur-sm ring-1 ring-[#C9261A]/10 p-5 shadow-sm">
              <ProductAccordion
                description={product.description}
                details={product.metadata as Record<string, string> | undefined}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trust badges row */}
      <TrustBadges />

      {/* Reviews */}
      <ProductReviews productTitle={product.title} />

      {/* Related products */}
      <RelatedProducts currentProductId={product.id} />
    </div>
  )
}
