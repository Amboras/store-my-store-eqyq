import { PLUGIN_REGISTRY } from '@/app/_generated/plugin-registry'
import { getPluginConfigs } from '@/lib/plugin-config'
import { ErrorBoundary } from '@/components/error-boundary'
import type { SlotName, ComponentEntry } from '@/types/plugins'

interface PluginSlotProps {
  name: Exclude<SlotName, 'head' | 'rootProviders'> | string
  context?: Record<string, unknown>
}

// Exported as BOTH default and named so any import style works.
async function PluginSlot({ name, context = {} }: PluginSlotProps) {
  const entries = PLUGIN_REGISTRY[name as Exclude<SlotName, 'head' | 'rootProviders'>] as ComponentEntry[]
  if (!entries?.length) return null

  const configs = await getPluginConfigs()

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

export default PluginSlot
export { PluginSlot }
