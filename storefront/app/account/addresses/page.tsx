'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { medusaClient } from '@/lib/medusa-client'
import AccountLayout from '@/components/account/account-layout'
import { MapPin, Plus, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AddressesPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    address_1: '',
    city: '',
    postal_code: '',
    country_code: 'us',
    phone: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await medusaClient.store.customer.listAddress({ limit: 50 })
      return response.addresses
    },
    retry: false,
  })

  const createAddress = useMutation({
    mutationFn: async () => {
      return medusaClient.store.customer.createAddress(form)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      setShowForm(false)
      setForm({ first_name: '', last_name: '', address_1: '', city: '', postal_code: '', country_code: 'us', phone: '' })
      toast.success('Address added')
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to add address'),
  })

  const deleteAddress = useMutation({
    mutationFn: async (id: string) => {
      return medusaClient.store.customer.deleteAddress(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('Address removed')
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to remove address'),
  })

  const addresses = data || []

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <AccountLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-h2 font-heading font-semibold">Addresses</h1>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold"
            >
              <Plus className="h-4 w-4" />
              Add Address
            </button>
          )}
        </div>

        {/* Add Address Form */}
        {showForm && (
          <div className="border rounded-sm p-6 mb-6">
            <h2 className="text-xs uppercase tracking-widest font-semibold mb-4">New Address</h2>
            <form
              onSubmit={(e) => { e.preventDefault(); createAddress.mutate() }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={form.first_name}
                  onChange={(e) => updateField('first_name', e.target.value)}
                  placeholder="First name"
                  required
                  className="border-b border-foreground/20 bg-transparent px-0 py-3 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"
                />
                <input
                  type="text"
                  value={form.last_name}
                  onChange={(e) => updateField('last_name', e.target.value)}
                  placeholder="Last name"
                  required
                  className="border-b border-foreground/20 bg-transparent px-0 py-3 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"
                />
              </div>
              <input
                type="text"
                value={form.address_1}
                onChange={(e) => updateField('address_1', e.target.value)}
                placeholder="Address"
                required
                className="w-full border-b border-foreground/20 bg-transparent px-0 py-3 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="City"
                  required
                  className="border-b border-foreground/20 bg-transparent px-0 py-3 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"
                />
                <input
                  type="text"
                  value={form.postal_code}
                  onChange={(e) => updateField('postal_code', e.target.value)}
                  placeholder="Postal code"
                  required
                  className="border-b border-foreground/20 bg-transparent px-0 py-3 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={createAddress.isPending}
                  className="bg-foreground text-background px-6 py-2.5 text-sm font-semibold uppercase tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {createAddress.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Address List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : addresses.length === 0 && !showForm ? (
          <div className="border border-dashed rounded-sm p-12 text-center">
            <MapPin className="h-8 w-8 mx-auto text-muted-foreground/40" strokeWidth={1.5} />
            <p className="mt-3 text-sm text-muted-foreground">No saved addresses</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-sm font-semibold underline underline-offset-4"
            >
              Add your first address
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {addresses.map((addr: any) => (
              <div key={addr.id} className="border rounded-sm p-5 relative group">
                <p className="text-sm font-medium">{addr.first_name} {addr.last_name}</p>
                <p className="text-sm text-muted-foreground mt-1">{addr.address_1}</p>
                <p className="text-sm text-muted-foreground">
                  {addr.city}{addr.postal_code ? `, ${addr.postal_code}` : ''}
                </p>
                <p className="text-sm text-muted-foreground uppercase">{addr.country_code}</p>
                {addr.phone && <p className="text-sm text-muted-foreground mt-1">{addr.phone}</p>}
                <button
                  onClick={() => deleteAddress.mutate(addr.id)}
                  className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Delete address"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  )
}
