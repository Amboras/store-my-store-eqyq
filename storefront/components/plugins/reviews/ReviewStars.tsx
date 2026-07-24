'use client'

import { useProductReviews } from '@amboras-dev/reviews'
import { Star } from 'lucide-react'

interface ReviewStarsProps {
  productId: string
  /** 'sm' for collection cards, 'md' for PDP (default) */
  size?: 'sm' | 'md'
}

export default function ReviewStars({ productId, size = 'md' }: ReviewStarsProps) {
  const { data, isLoading } = useProductReviews(productId, { perPage: 1 })

  if (isLoading || !data || data.stats.totalCount === 0) return null

  const { averageRating, totalCount } = data.stats
  const stars = Math.round(averageRating)
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <div className={`flex items-center gap-1.5 ${size === 'sm' ? 'mt-1' : 'mt-2'}`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`${iconSize} ${i <= stars ? 'fill-yellow-400 text-yellow-400' : 'fill-muted text-muted-foreground'}`}
            strokeWidth={1.5}
          />
        ))}
      </div>
      {size !== 'sm' && (
        <span className={`${textSize} text-muted-foreground`}>
          {averageRating.toFixed(1)} ({totalCount} {totalCount === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  )
}
