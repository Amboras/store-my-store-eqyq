'use client'

import { useAuth } from '@/hooks/use-auth'
import AccountLayout from '@/components/account/account-layout'
import Link from 'next/link'
import { Package, MapPin, User, ArrowRight } from 'lucide-react'

export default function AccountPage() {
  const { customer } = useAuth()

  return (
    <AccountLayout>
      <div>
        <h1 className="text-h2 font-heading font-semibold mb-2">
          Hello, {customer?.first_name || 'there'}
        </h1>
        <p className="text-muted-foreground mb-8">
          Manage your orders, addresses, and profile settings.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/account/orders"
            className="group border rounded-sm p-6 hover:border-foreground transition-colors"
          >
            <Package className="h-6 w-6 mb-3" strokeWidth={1.5} />
            <h2 className="font-medium">Orders</h2>
            <p className="text-sm text-muted-foreground mt-1">View your order history</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              View <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            href="/account/addresses"
            className="group border rounded-sm p-6 hover:border-foreground transition-colors"
          >
            <MapPin className="h-6 w-6 mb-3" strokeWidth={1.5} />
            <h2 className="font-medium">Addresses</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage shipping addresses</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              View <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            href="/account/profile"
            className="group border rounded-sm p-6 hover:border-foreground transition-colors"
          >
            <User className="h-6 w-6 mb-3" strokeWidth={1.5} />
            <h2 className="font-medium">Profile</h2>
            <p className="text-sm text-muted-foreground mt-1">Update your details</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              View <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>

        {/* Quick Account Info */}
        {customer && (
          <div className="mt-8">
            <h2 className="text-xs uppercase tracking-widest font-semibold mb-4">Account Details</h2>
            <div className="border rounded-sm divide-y text-sm">
              <div className="p-4">
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-medium mt-0.5">{customer.first_name} {customer.last_name}</p>
              </div>
              <div className="p-4">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium mt-0.5">{customer.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AccountLayout>
  )
}
