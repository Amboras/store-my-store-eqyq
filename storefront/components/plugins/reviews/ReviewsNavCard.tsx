'use client'

import Link from 'next/link'
import { Star, ChevronRight } from 'lucide-react'

/**
 * Appears in the account overview slot.
 * Gives customers a visible entry point to write reviews for products they've purchased.
 */
export default function ReviewsNavCard() {
  return (
    <Link
      href="/account/reviews"
      className="group flex items-center justify-between gap-4 rounded-sm border p-5 hover:border-accent transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-muted">
          <Star className="h-5 w-5 text-foreground" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-medium">Review your purchases</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Share your experience with products you&apos;ve received
          </p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
    </Link>
  )
}
