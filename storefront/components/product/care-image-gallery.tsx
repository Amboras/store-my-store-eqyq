'use client'

import { useState } from 'react'
import Image from 'next/image'

type GalleryImage = { url: string }

export default function CareImageGallery({
  images,
  title,
}: {
  images: GalleryImage[]
  title: string
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const safeImages = images.length > 0 ? images : [{ url: '' }]
  const active = safeImages[activeIndex] ?? safeImages[0]

  return (
    <div className="flex gap-3 sm:gap-4">
      {/* Thumbnail rail */}
      <div className="flex flex-col gap-2 sm:gap-3 w-16 sm:w-20 flex-shrink-0">
        {safeImages.slice(0, 6).map((img, i) => {
          const isActive = i === activeIndex
          return (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Show image ${i + 1}`}
              aria-pressed={isActive}
              className={`relative aspect-square overflow-hidden rounded-lg sm:rounded-xl bg-[#F4E9DD] transition-all ${
                isActive
                  ? 'ring-2 ring-[#D63A1F] ring-offset-2 ring-offset-[#F7EFE5]'
                  : 'ring-1 ring-black/5 hover:ring-black/15'
              }`}
            >
              {img.url && (
                <Image
                  src={img.url}
                  alt={`${title} thumbnail ${i + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Main image */}
      <div className="relative flex-1 aspect-square overflow-hidden rounded-2xl bg-[#F4E9DD]">
        {active.url && (
          <Image
            src={active.url}
            alt={title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 600px"
            className="object-cover"
          />
        )}
      </div>
    </div>
  )
}
