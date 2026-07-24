import type { PluginConfigs } from '@/types/plugins'

export async function getPluginConfigs(): Promise<PluginConfigs> {
  const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  const storeId = process.env.NEXT_PUBLIC_STORE_ID

  try {
    const res = await fetch(`${baseUrl}/store/integrations/active`, {
      headers: {
        'x-publishable-api-key': publishableKey ?? '',
        'x-store-environment-id': storeId ?? '',
      },
      next: { revalidate: 60 },
    })
    if (!res.ok) return {}
    return await res.json()
  } catch {
    return {}
  }
}
