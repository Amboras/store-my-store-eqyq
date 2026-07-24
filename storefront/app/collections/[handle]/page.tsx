import { PluginSlot } from '@/components/PluginSlot'
import { notFound } from 'next/navigation'
import { medusaServerClient } from '@/lib/medusa-client'
import ProductGrid from '@/components/product/product-grid'

async function getCollection(handle: string) {
  try {
    const response = await medusaServerClient.store.collection.list({
      handle: [handle],
    })
    return response.collections?.[0] || null
  } catch (error) {
    console.error('Error fetching collection:', error)
    return null
  }
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const collection = await getCollection(handle)

  if (!collection) {
    notFound()
  }

  const description = collection.metadata?.description
  const hasDescription = typeof description === 'string' && description

  return (
    <>
      <div className="border-b">
        <div className="container-custom py-section-sm text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">Collection</p>
          <h1 className="text-h1 font-heading font-semibold">{collection.title}</h1>
          {hasDescription && (
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">{description as string}</p>
          )}
        </div>
      </div>
      <div className="container-custom py-8">
        <PluginSlot name="collectionAboveGrid" />
        <ProductGrid collectionId={collection.id} limit={100} />
        <PluginSlot name="collectionBelowGrid" />
      </div>
    </>
  )
}
