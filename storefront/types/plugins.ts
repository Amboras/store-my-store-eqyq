/**
 * Plugin slot system types for the storefront.
 *
 * SLOT_NAMES, SlotName, ScriptEntry, and PluginConfigs come from
 * @amboras-dev/plugin-types (the single source of truth shared with the
 * orchestrator). React-specific types are defined here and extend from them.
 */

export { SLOT_NAMES, type SlotName, type ScriptEntry, type PluginConfigs } from '@amboras-dev/plugin-types'
import type { SlotName, ScriptEntry } from '@amboras-dev/plugin-types'

/** rootProviders slot entry — null-rendering React component that initializes a service. */
export interface ProviderEntry {
  id: string
  Component: React.ComponentType<any>
  propsFromConfig?: Record<string, string>
}

/** Any visible or invisible component rendered into a slot. */
export interface ComponentEntry {
  id: string
  Component: React.ComponentType<any>
  propsFromContext?: string[]
  propsFromConfig?: Record<string, string>
}

export type PluginRegistry = {
  head: ScriptEntry[]
  rootProviders: ProviderEntry[]
} & {
  [K in Exclude<SlotName, 'head' | 'rootProviders'>]: ComponentEntry[]
}
