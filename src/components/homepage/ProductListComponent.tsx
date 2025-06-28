'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/useTranslation';
import { ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import ProductCard from '@/components/ui/ProductCard';
import { GridPattern } from '@/components/magicui/grid-pattern';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: {
    original: string;
    actual: string;
    discount?: string;
    formatted: string;
    formatted_original: string;
    discount_percentage: number;
    currency: string;
  };
  image?: {
    id: number;
    url?: string;
    full_link?: string;
    path: string;
    filename: string;
    alt_text?: string;
  };
  rating?: number;
  reviews_count?: number;
  is_discounted?: boolean;
}

interface ProductListComponentProps {
  component: {
    id: number;
    type: string;
    name: string;
    data: {
      title: string;
      products: Product[];
      view_all_link?: string;
      settings: any;
    };
  };
}

export default function ProductListComponent({ component }: ProductListComponentProps) {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const { title, products = [], view_all_link, settings } = component.data;
  const isGrid = settings?.is_grid || false;
  const itemsPerSlide = 4;

  if (!products || products.length === 0) {
    return null;
  }

  const maxSlides = Math.max(1, Math.ceil(products.length / itemsPerSlide) - 1);

  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, maxSlides));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <div className="relative w-full bg-gradient-to-br from-zinc-900/60 via-zinc-900/40 to-zinc-800/60 backdrop-blur-2xl border border-zinc-800/50 rounded-2xl shadow-xl px-6 py-8 flex flex-col items-center justify-center overflow-hidden">
            {/* Grid Pattern Background */}
            <GridPattern className="absolute inset-0 w-full h-full opacity-20 pointer-events-none [mask-image:radial-gradient(300px_circle_at_center,white,transparent)]" />
            
            {/* Decorative Elements */}
            <div className="absolute top-3 left-3 w-1.5 h-1.5 bg-emerald-400 rounded-full opacity-50"></div>
            <div className="absolute top-4 right-4 w-1 h-1 bg-blue-400 rounded-full opacity-50"></div>
            <div className="absolute bottom-4 left-4 w-1 h-1 bg-purple-400 rounded-full opacity-50"></div>
            <div className="absolute bottom-3 right-3 w-1.5 h-1.5 bg-emerald-400 rounded-full opacity-50"></div>
            
            <div className="relative z-10 flex flex-col items-center w-full">
              {/* Icon Badge */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-xl blur-lg"></div>
                <div className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-xl shadow-lg">
                  <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
              </div>
              
              {/* Section Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-medium mb-4">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                <span>{t('products.featuredCollection')}</span>
              </div>
              
              {/* Main Title */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-4 tracking-tight">
                <span className="bg-gradient-to-r from-white via-emerald-100 to-emerald-200 bg-clip-text text-transparent">
            {title}
                </span>
          </h2>
              
              {/* Decorative Line */}
              <div className="w-24 h-0.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-full mx-auto mb-4"></div>
              
              {/* Subtitle */}
              <p className="text-zinc-300 text-base sm:text-lg text-center max-w-xl mb-6 leading-relaxed">
                {t('products.discoverCurated')}
              </p>
              
              {/* CTA Button */}
          {view_all_link && (
            <Link
              href={view_all_link}
                  className="group inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 hover:scale-105"
            >
                  <span>{t('products.viewAllProducts')}</span>
                  <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          )}
            </div>
          </div>
        </div>

        {/* Products Display */}
        {isGrid || products.length <= 4 ? (
          // Grid layout
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.slice(0, isGrid ? 12 : 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          // Carousel layout
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from({ length: Math.ceil(products.length / itemsPerSlide) }, (_, slideIndex) => (
                  <div key={slideIndex} className="flex-shrink-0 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {products.slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide).map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            {products.length > itemsPerSlide && (
              <>
                <button
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-card/80 hover:bg-card text-foreground p-2 rounded-full shadow-lg transition-all z-10 disabled:opacity-50 disabled:cursor-not-allowed border border-border/50"
                  aria-label="Previous products"
                >
                  <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <button
                  onClick={nextSlide}
                  disabled={currentSlide >= maxSlides}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-card/80 hover:bg-card text-foreground p-2 rounded-full shadow-lg transition-all z-10 disabled:opacity-50 disabled:cursor-not-allowed border border-border/50"
                  aria-label="Next products"
                >
                  <ChevronRightIcon className="h-6 w-6" />
                </button>

                {/* Hint text */}
                <div className="text-center mt-6">
                  <p className="text-sm text-muted-foreground">
                    {t('swipeForMore')}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}