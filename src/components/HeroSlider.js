'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite'

const fallbackSlides = [
  {
    title: 'Premium T-Shirts',
    subtitle: 'Crafted for the modern minimalist',
    cta: 'Shop Now',
    link: '/shop/t-shirts',
    image_url: null,
  },
  {
    title: 'Essential Caps',
    subtitle: 'Timeless design, everyday wear',
    cta: 'Explore Caps',
    link: '/shop/caps',
    image_url: null,
  },
  {
    title: 'New Collection',
    subtitle: 'Noir & Alabaster — exclusively monochrome',
    cta: 'View All',
    link: '/',
    image_url: null,
  },
]

export default function HeroSlider() {
  const [slides, setSlides] = useState(fallbackSlides)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    databases.listDocuments(DATABASE_ID, COLLECTIONS.carouselSlides, []).then(({ documents }) => {
      if (documents && documents.length > 0) {
        setSlides(documents.map(s => ({
          title: s.title || '',
          subtitle: s.subtitle || '',
          cta: 'Shop Now',
          link: s.redirect_url || '/',
          image_url: s.image_url,
        })))
      }
    })
  }, [])

  useEffect(() => {
    if (slides.length === 0) return
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [slides.length])

  const goTo = (index) => setCurrent(index)
  const prev = () => setCurrent(prev => (prev - 1 + slides.length) % slides.length)
  const next = () => setCurrent(prev => (prev + 1) % slides.length)

  if (slides.length === 0) return null

  return (
    <div className="relative w-full h-[60vh] min-h-[400px] bg-black overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {slide.image_url && (
            <img
              src={slide.image_url}
              alt={slide.title || ''}
              className="absolute inset-0 w-full h-full object-cover opacity-50"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="text-center px-6 max-w-2xl animate-fade-in">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
                {slide.title}
              </h1>
              {slide.subtitle && (
                <p className="text-lg sm:text-xl text-white/70 mb-8">
                  {slide.subtitle}
                </p>
              )}
              <a
                href={slide.link}
                className="inline-block bg-white text-black px-8 py-3 text-sm uppercase tracking-widest font-medium hover:bg-white/90 transition-colors"
              >
                {slide.cta}
              </a>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft size={28} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight size={28} />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === current ? 'bg-white w-6' : 'bg-white/40'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
