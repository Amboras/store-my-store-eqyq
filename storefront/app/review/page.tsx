'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import WriteReview from '@/components/plugins/reviews/WriteReview'

function ReviewFormContent() {
  const params = useSearchParams()
  const productId = params.get('product_id')
  const orderId = params.get('order_id')

  if (!productId || !orderId) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground text-sm">
          Invalid review link. Please use the link from your email.
        </p>
      </div>
    )
  }

  return <WriteReview productId={productId} orderId={orderId} />
}

export default function ReviewPage() {
  return (
    <div className="container-custom py-12 max-w-2xl">
      <h1 className="font-heading text-2xl font-semibold mb-2">Write a Review</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Share your experience to help other shoppers.
      </p>
      <Suspense fallback={<div className="animate-pulse h-48 rounded-sm bg-muted" />}>
        <ReviewFormContent />
      </Suspense>
    </div>
  )
}
