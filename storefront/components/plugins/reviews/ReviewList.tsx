'use client'

import { useState } from 'react'
import { useProductReviews } from '@amboras-dev/reviews'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'

interface ReviewListProps {
  productId: string
  perPage?: number
}

// Review media URLs are customer-submitted and reviews can auto-approve, so a
// crafted `javascript:`/`data:` URL would be reachable stored-XSS when rendered
// in <a href>/<img src>. Only allow http(s) — mirrors the admin's safeMediaUrl.
function safeMediaUrl(raw: string): string | null {
  try {
    const u = new URL(raw)
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null
  } catch {
    return null
  }
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-muted text-muted-foreground'}`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  )
}

export default function ReviewList({ productId, perPage = 5 }: ReviewListProps) {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useProductReviews(productId, { page, perPage })

  if (isLoading) {
    return (
      <div className="space-y-4 mt-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse space-y-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-3 w-full bg-muted rounded" />
            <div className="h-3 w-3/4 bg-muted rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (!data || data.stats.totalCount === 0) {
    return (
      <div className="mt-6 py-8 text-center border rounded-sm">
        <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review this product.</p>
      </div>
    )
  }

  const totalPages = Math.ceil(data.count / perPage)

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-widest">
          Reviews ({data.stats.totalCount})
        </h3>
        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" strokeWidth={1.5} />
          <span className="text-sm font-medium">{data.stats.averageRating.toFixed(1)}</span>
        </div>
      </div>

      <div className="divide-y">
        {data.reviews.map((review) => (
          <div key={review.id} className="py-5 space-y-2">
            <div className="flex items-center justify-between">
              <StarRow rating={review.rating} />
              <span className="text-xs text-muted-foreground">
                {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            {review.title && (
              <p className="text-sm font-medium">{review.title}</p>
            )}
            {review.content && (
              <p className="text-sm text-muted-foreground leading-relaxed">{review.content}</p>
            )}
            {Array.isArray(review.media) && review.media.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {review.media.map((m, i) => {
                  const url = safeMediaUrl(m.url)
                  if (!url) return null
                  return m.type === 'video' ? (
                    <video
                      key={i}
                      src={url}
                      controls
                      className="h-24 w-24 rounded-sm border object-cover"
                    />
                  ) : (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={url}
                        alt="Customer review photo"
                        loading="lazy"
                        className="h-24 w-24 rounded-sm border object-cover transition-opacity hover:opacity-90"
                      />
                    </a>
                  )
                })}
              </div>
            )}
            {review.customer_name && (
              <p className="text-xs text-muted-foreground">— {review.customer_name}</p>
            )}
            {review.reply && (
              <div className="mt-3 pl-4 border-l-2 border-muted">
                <p className="text-xs font-medium mb-1">Store response</p>
                <p className="text-sm text-muted-foreground">{review.reply}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <span className="text-xs text-muted-foreground">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
