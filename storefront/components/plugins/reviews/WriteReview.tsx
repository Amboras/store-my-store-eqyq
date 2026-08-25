'use client'

import { useState, useEffect } from 'react'
import { useCreateReview, useUpdateReview, useMyReviews } from '@amboras-dev/reviews'
import { Star } from 'lucide-react'
import { toast } from 'sonner'

interface WriteReviewProps {
  productId: string
  orderId?: string
}

export default function WriteReview({ productId, orderId }: WriteReviewProps) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  // Load the customer's existing review for this order so returning to the form
  // edits it instead of showing a blank "new review" panel (and creating a dup).
  const { data: myReviews, isLoading: loadingExisting } = useMyReviews(
    orderId ? { orderIds: [orderId] } : {},
  )
  const { mutate: createReview, isPending: creating } = useCreateReview()
  const { mutate: updateReview, isPending: updating } = useUpdateReview()
  const isPending = creating || updating

  useEffect(() => {
    const existing = myReviews?.reviews?.find((r) => r.product_id === productId)
    if (existing) {
      setEditingId(existing.id)
      setRating(existing.rating || 0)
      setTitle(existing.title || '')
      setContent(existing.content || '')
    }
  }, [myReviews, productId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating) {
      toast.error('Please select a star rating')
      return
    }

    if (editingId) {
      updateReview(
        { reviewId: editingId, rating, title, content },
        {
          onSuccess: () => toast.success('Review updated! It will be re-checked before it goes live.'),
          onError: (err) => toast.error(err.message ?? 'Failed to update review'),
        },
      )
      return
    }

    if (!orderId) {
      toast.error('A completed order is required to leave a review')
      return
    }
    createReview(
      { product_id: productId, order_id: orderId, rating, title, content },
      {
        onSuccess: (data) => {
          toast.success('Review submitted! Thank you.')
          if (data.discount_code) {
            toast.success(`Your discount code: ${data.discount_code}`, { duration: 10000 })
          }
          setEditingId(data.review?.id ?? null)
        },
        onError: (err) => toast.error(err.message ?? 'Failed to submit review'),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 border rounded-sm p-6">
      <h3 className="text-sm font-semibold uppercase tracking-widest">
        {editingId ? 'Edit Your Review' : 'Write a Review'}
      </h3>
      {editingId && (
        <p className="text-xs text-muted-foreground">You already reviewed this product — update it below.</p>
      )}

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`h-6 w-6 ${i <= (hovered || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>

      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Review title (optional)"
          className="w-full border-b border-foreground/20 bg-transparent px-0 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"
        />
      </div>

      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your experience..."
          rows={4}
          className="w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors rounded-sm resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || loadingExisting}
        className="w-full bg-foreground text-background py-3 text-sm font-semibold uppercase tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isPending
          ? (editingId ? 'Updating...' : 'Submitting...')
          : (editingId ? 'Update Review' : 'Submit Review')}
      </button>
    </form>
  )
}
