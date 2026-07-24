'use client'

import { useQuery } from '@tanstack/react-query'
import { PLUGIN_REGISTRY } from '@/app/_generated/plugin-registry'
import { ErrorBoundary } from '@/components/error-boundary'
import type { SlotName, ComponentEntry, PluginConfigs } from '@/types/plugins'

async function fetchPluginConfigs(): Promise<PluginConfigs> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/integrations/active`,
      {
        headers: {
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? '',
          'x-store-environment-id': process.env.NEXT_PUBLIC_STORE_ID ?? '',
        },
      }
    )
    if (!res.ok) return {}
    return await res.json()
  } catch {
    return {}
  }
}

interface ClientPluginSlotProps {
  name: Exclude<SlotName, 'head' | 'rootProviders'>
  context?: Record<string, unknown>
}

// Exported as BOTH default and named so any import style works.
function ClientPluginSlot({ name, context = {} }: ClientPluginSlotProps) {
  const entries = PLUGIN_REGISTRY[name] as ComponentEntry[]

  const { data: configs = {} } = useQuery({
    queryKey: ['plugin-configs'],
    queryFn: fetchPluginConfigs,
    staleTime: 60_000,
    enabled: entries?.length > 0,
  })

  if (!entries?.length) return null

  return (
    <>
      {entries.map(({ id, Component, propsFromContext = [], propsFromConfig = {} }) => {
        if (configs[id]?.enabled === false) return null

        const ctxProps = Object.fromEntries(propsFromContext.map((k) => [k, context[k]]))
        const cfgProps = Object.fromEntries(
          Object.entries(propsFromConfig).map(([prop, key]) => [prop, configs[id]?.[key]])
        )

        return (
          <ErrorBoundary key={id} fallback={null}>
            <Component {...ctxProps} {...cfgProps} />
          </ErrorBoundary>
        )
      })}
    </>
  )
}

export default ClientPluginSlot
export { ClientPluginSlot }
