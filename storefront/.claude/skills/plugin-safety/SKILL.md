---
name: plugin-safety
description: Rules for safely working around the Amboras plugin system. Use whenever editing storefront files that contain AMBORAS comments, PluginSlot or ClientPluginSlot components, import blocks tagged with AMBORAS, or the app/_generated/ directory. Triggers on "PluginSlot", "ClientPluginSlot", "AMBORAS", "plugin", "_generated", or any edit to header.tsx, footer.tsx, product detail page, cart drawer, checkout, or account pages that may contain plugin injection points.
---

# Plugin Safety Rules

The Amboras plugin system injects and manages code in storefront files using comment tags as markers. Destroying a marker silently breaks plugin installs with no easy recovery path. These rules are non-negotiable.

## The four protected constructs

### 1. Tagged JSX blocks — NEVER touch the comments

```tsx
{/* AMBORAS:REVIEWS:START id=reviewstars-pdpaftertitle slot=pdpAfterTitle */}
<ReviewStars productId={product.id} />
{/* AMBORAS:REVIEWS:END */}
```

**You MAY:** Edit the JSX between START and END — that code is yours.

**NEVER:**
- Delete or rename the `START` or `END` comment
- Move the block to a different file or position
- Change `id=` or `slot=` values in the comment
- Wrap the block in a condition that changes slot context

### 2. Tagged import blocks — NEVER touch the comment lines

```ts
// AMBORAS:REVIEWS:IMPORT:reviewstars-pdpaftertitle
import ReviewStars from '@/components/plugins/reviews/ReviewStars'
// AMBORAS:REVIEWS:IMPORT:END
```

**NEVER:**
- Delete the `IMPORT` comment lines
- Move the import outside the tagged block
- Change the tag identifier

### 3. PluginSlot and ClientPluginSlot tags — NEVER move or delete

```tsx
<PluginSlot name="pdpAfterTitle" context={{ productId: product.id }} />
<ClientPluginSlot name="cartDrawerFooter" context={{ cartId: cart?.id }} />
```

These render nothing visible for Class B plugins but are required infrastructure. The codemod scans for them to know which file to inject into. A missing slot = future plugin installs fail.

**NEVER:**
- Delete a `PluginSlot` or `ClientPluginSlot` tag
- Change the `name` attribute
- Move the tag to a different file

### 4. `app/_generated/plugin-registry.ts` — NEVER edit

Machine-generated on every plugin install/upgrade/uninstall. Any changes are silently overwritten on the next operation.

**You MAY read it.** Never write it.

## Quick rule of thumb

> If a line or block contains the word `AMBORAS`, a `PluginSlot` component, or lives in `app/_generated/` — do not touch it.

Everything else in the storefront is yours to edit freely.

## What PluginSlot / ClientPluginSlot are

```tsx
// PluginSlot — async Server Component
// Use in: server component pages (PDP, collection, checkout success, account)
<PluginSlot name="pdpAfterTitle" context={ productId: product.id } />

// ClientPluginSlot — client component wrapper
// Use in: 'use client' components (cart drawer, header, homepage sections)
<ClientPluginSlot name="cartDrawerFooter" context={ cartId: cart?.id } />
```

Both return `null` immediately when no plugins are installed for that slot — zero performance cost when unused. Each plugin is wrapped in an ErrorBoundary so a broken plugin never crashes the page.

## If you need to add a new slot

Add the tag in the appropriate file and position. Use `PluginSlot` for server components, `ClientPluginSlot` for client components. The `name` value must match what the plugin manifest declares — coordinate with whoever is writing the plugin manifest.

Do not invent slot names arbitrarily in storefront files; the orchestrator must know about them.
