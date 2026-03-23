'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Package, MapPin, User, LogOut, Loader2, ChevronRight } from 'lucide-react'

const navItems = [
  { href: '/account', label: 'Overview', icon: User },
  { href: '/account/orders', label: 'Orders', icon: Package },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  { href: '/account/profile', label: 'Profile', icon: User },
]

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { customer, isLoggedIn, isLoading, logout, isLoggingOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/auth/login')
    }
  }, [isLoading, isLoggedIn, router])

  if (isLoading) {
    return (
      <div className="container-custom py-section flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!customer) return null

  return (
    <>
      <div className="border-b">
        <div className="container-custom py-3">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Account</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8 lg:py-12">
        <div className="grid lg:grid-cols-[200px_1fr] gap-10 lg:gap-16">
          {/* Sidebar */}
          <aside className="space-y-1">
            <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">
              Account
            </p>
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 py-2 text-sm transition-colors ${
                    isActive ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" strokeWidth={1.5} />
                  {item.label}
                </Link>
              )
            })}
            <button
              onClick={() => logout()}
              disabled={isLoggingOut}
              className="flex items-center gap-2.5 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-4 pt-4 border-t w-full"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
              {isLoggingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </aside>

          {/* Content */}
          <div>{children}</div>
        </div>
      </div>
    </>
  )
}
