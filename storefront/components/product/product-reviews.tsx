'use client'

import { useState } from 'react'
import { Star, ThumbsUp, BadgeCheck } from 'lucide-react'

interface ProductReviewsProps {
  productTitle: string
}

interface Review {
  id: string
  author: string
  initials: string
  date: string
  rating: number
  title: string
  body: string
  verified: boolean
  helpful: number
}

const SAMPLE_REVIEWS: Review[] = [
  {
    id: 'r1',
    author: 'Sarah M.',
    initials: 'SM',
    date: '2 weeks ago',
    rating: 5,
    title: 'Absolutely love it',
    body: "Honestly exceeded my expectations. Quality feels premium and the design is exactly what was shown. I've already recommended it to two friends.",
    verified: true,
    helpful: 24,
  },
  {
    id: 'r2',
    author: 'James T.',
    initials: 'JT',
    date: '3 weeks ago',
    rating: 5,
    title: 'Worth every penny',
    body: 'Was hesitant at first because of the price, but it really delivers. Feels great, looks great, and shipping was faster than expected.',
    verified: true,
    helpful: 18,
  },
  {
    id: 'r3',
    author: 'Priya K.',
    initials: 'PK',
    date: '1 month ago',
    rating: 4,
    title: 'Beautiful, runs slightly small',
    body: 'Lovely product overall. Just be aware sizing runs a touch small — I went up one size and the fit is perfect. Would buy again.',
    verified: true,
    helpful: 11,
  },
  {
    id: 'r4',
    author: 'Marcus R.',
    initials: 'MR',
    date: '1 month ago',
    rating: 5,
    title: 'Bought as a gift — huge hit',
    body: 'My partner has not stopped using it since it arrived. Packaging was beautiful too, felt like a proper unboxing experience.',
    verified: true,
    helpful: 9,
  },
  {
    id: 'r5',
    author: 'Lena O.',
    initials: 'LO',
    date: '2 months ago',
    rating: 5,
    title: 'Daily go-to',
    body: 'It really has become a daily essential. Comfortable, well made, and the small details show care. Five stars from me.',
    verified: true,
    helpful: 7,
  },
]

const RATING_DISTRIBUTION = [
  { stars: 5, count: 184 },
  { stars: 4, count: 41 },
  { stars: 3, count: 8 },
  { stars: 2, count: 2 },
  { stars: 1, count: 1 },
]

const TOTAL_REVIEWS = RATING_DISTRIBUTION.reduce((sum, r) => sum + r.count, 0)
const AVERAGE_RATING =
  RATING_DISTRIBUTION.reduce((sum, r) => sum + r.stars * r.count, 0) / TOTAL_REVIEWS

function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 'h-5 w-5' : size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${dim} ${
            i <= Math.round(rating) ? 'fill-accent text-accent' : 'fill-muted text-muted'
          }`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  )
}

export default function ProductReviews({ productTitle }: ProductReviewsProps) {
  const [filter, setFilter] = useState<number | 'all'>('all')
  const [showAll, setShowAll] = useState(false)
  const [helpfulIds, setHelpfulIds] = useState<Set<string>>(new Set())

  const filteredReviews =
    filter === 'all' ? SAMPLE_REVIEWS : SAMPLE_REVIEWS.filter((r) => r.rating === filter)

  const visibleReviews = showAll ? filteredReviews : filteredReviews.slice(0, 3)

  const toggleHelpful = (id: string) => {
    setHelpfulIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <section id="reviews" className="border-t">
      <div className="container-custom py-12 lg:py-16">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
            Customer Reviews
          </p>
          <h2 className="text-h2 font-heading font-semibold">What people say about it</h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Summary */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="text-center lg:text-left">
              <div className="flex items-baseline gap-2 justify-center lg:justify-start">
                <span className="text-5xl font-heading font-semibold">
                  {AVERAGE_RATING.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">/ 5</span>
              </div>
              <div className="mt-2 flex justify-center lg:justify-start">
                <StarRow rating={AVERAGE_RATING} size="lg" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Based on {TOTAL_REVIEWS} verified reviews
              </p>
            </div>

            {/* Distribution */}
            <div className="space-y-2">
              {RATING_DISTRIBUTION.map((row) => {
                const pct = (row.count / TOTAL_REVIEWS) * 100
                const isActive = filter === row.stars
                return (
                  <button
                    key={row.stars}
                    type="button"
                    onClick={() => setFilter(isActive ? 'all' : row.stars)}
                    className={`w-full flex items-center gap-3 text-xs group transition-opacity ${
                      filter !== 'all' && !isActive ? 'opacity-50' : 'opacity-100'
                    }`}
                  >
                    <span className="w-8 tabular-nums text-left">{row.stars} ★</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 tabular-nums text-right text-muted-foreground">
                      {row.count}
                    </span>
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              className="w-full py-3 text-xs font-semibold uppercase tracking-wider border border-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              Write a Review
            </button>
          </aside>

          {/* Reviews list */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {visibleReviews.length} of {filteredReviews.length}
                {filter !== 'all' ? ` ${filter}-star` : ''} review{filteredReviews.length === 1 ? '' : 's'}
              </p>
              {filter !== 'all' && (
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear filter
                </button>
              )}
            </div>

            {filteredReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">
                No reviews match this filter yet.
              </p>
            ) : (
              <ul className="space-y-8">
                {visibleReviews.map((review) => {
                  const isHelpful = helpfulIds.has(review.id)
                  return (
                    <li key={review.id} className="border-b pb-8 last:border-b-0 last:pb-0">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
                          {review.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                            <span className="text-sm font-semibold">{review.author}</span>
                            {review.verified && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-green-700 dark:text-green-500">
                                <BadgeCheck className="h-3.5 w-3.5" strokeWidth={1.8} />
                                Verified Buyer
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">{review.date}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <StarRow rating={review.rating} size="sm" />
                          </div>
                          <h3 className="text-sm font-semibold mb-1.5">{review.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                            {review.body}
                          </p>
                          <button
                            type="button"
                            onClick={() => toggleHelpful(review.id)}
                            className={`inline-flex items-center gap-1.5 text-xs transition-colors ${
                              isHelpful ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <ThumbsUp
                              className={`h-3.5 w-3.5 ${isHelpful ? 'fill-accent' : ''}`}
                              strokeWidth={1.8}
                            />
                            Helpful ({review.helpful + (isHelpful ? 1 : 0)})
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}

            {filteredReviews.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="mt-8 text-sm font-semibold uppercase tracking-wider underline-offset-4 hover:underline"
              >
                {showAll ? 'Show less' : `Show all ${filteredReviews.length} reviews`}
              </button>
            )}

            <p className="sr-only">Reviews about {productTitle}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
