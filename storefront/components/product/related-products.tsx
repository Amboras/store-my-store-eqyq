import Link from 'next/link'
import { medusaServerClient } from '@/lib/medusa-client'
import ProductCard from './product-card'
import { type VariantExtension } from './product-price'

interface RelatedProductsProps {
  currentProductId: string
}

async function fetchRelated(currentProductId: string) {
  try {
    const regionsResponse = await medusaServerClient.store.region.list()
    const regionId = regionsResponse.regions[0]?.id
    if (!regionId) return []

    const response = await medusaServerClient.store.product.list({
      region_id: regionId,
      limit: 8,
      fields: '*variants.calculated_price',
    })

    return (response.products || []).filter((p) => p.id !== currentProductId).slice(0, 4)
  } catch (error) {
    console.error('Error fetching related products:', error)
    return []
  }
}

async function fetchVariantExtensions(
  productIds: string[],
): Promise<Record<string, Record<string, VariantExtension>>> {
  const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
  const storeId = process.env.NEXT_PUBLIC_STORE_ID
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  const headers: Record<string, string> = {}
  if (storeId) headers['X-Store-Environment-ID'] = storeId
  if (publishableKey) headers['x-publishable-api-key'] = publishableKey

  const result: Record<string, Record<string, VariantExtension>> = {}

  await Promise.all(
    productIds.map(async (productId) => {
      try {
        const res = await fetch(
          `${baseUrl}/store/product-extensions/products/${productId}/variants`,
          { headers, next: { revalidate: 60 } },
        )
        if (!res.ok) return
        const data = await res.json()
        const map: Record<string, VariantExtension> = {}
        for (const v of data.variants || []) {
          map[v.id] = {
            compare_at_price: v.compare_at_price,
            allow_backorder: v.allow_backorder ?? false,
            inventory_quantity: v.inventory_quantity,
          }
        }
        result[productId] = map
      } catch {
        // ignore failures per product
      }
    }),
  )

  return result
}

export default async function RelatedProducts({ currentProductId }: RelatedProductsProps) {
  const products = await fetchRelated(currentProductId)
  if (products.length === 0) return null

  const extensionsByProduct = await fetchVariantExtensions(products.map((p) => p.id))

  return (
    <section className="border-t border-[#C9261A]/10">
      <div className="container-custom py-12 lg:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#C9261A] font-bold mb-2">
              You may also like
            </p>
            <h2 className="text-h2 font-heading font-bold text-[#3A0F08]">Pairs well with</h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-block text-sm uppercase tracking-wider font-semibold text-[#C9261A] hover:text-[#7A1F12] transition-colors"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variantExtensions={extensionsByProduct[product.id]}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
