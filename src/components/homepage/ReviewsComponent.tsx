import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/lib/sdk';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/components/LanguageProvider';
import Link from 'next/link';

interface Review {
  id: number;
  customer_name?: string;
  name?: string;
  rating: number;
  comment: string;
  created_at: string;
  product_name?: string;
  product?: {
    name: string;
  };
}

interface ReviewsComponentProps {
  className?: string;
  component?: any;
}

export default function ReviewsComponent({ className = '' }: ReviewsComponentProps) {
  const { locale } = useLanguage();
  const isRTL = locale === 'ar';
  const [currentSlide, setCurrentSlide] = useState(0);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['store-reviews'],
    queryFn: async () => {
      const result = await sdk.reviews.getAll({ per_page: 12 });
      // Filter for store reviews only (reviews without a product)
      const storeReviews = result?.data?.filter((review: any) => !review.product) || [];
      return storeReviews;
    },
  });

  const reviewsPerSlide = 1;
  const maxSlides = Math.max(0, reviews.length - 1);

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 bg-muted animate-pulse rounded mb-4"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-96 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card p-6 rounded-lg border animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!reviews || reviews.length === 0) {
    return null;
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % reviews.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? 'text-yellow-400 fill-yellow-400'
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  return (
    <section className={`py-16 ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
            ما يقوله عملاؤنا
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            اكتشف تجارب العملاء الحقيقية مع منتجاتنا وخدماتنا
          </p>
        </div>

        <div className="relative">
          {/* Navigation Buttons */}
          {reviews.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
                onClick={nextSlide}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Reviews Container */}
          <div className="overflow-hidden" ref={containerRef}>
            <motion.div
              className={`flex ${isRTL ? 'flex-row-reverse' : ''}`}
              style={{
                transform: `translateX(-${currentSlide * 100}%)`,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {reviews.map((review) => (
                <div key={review.id} className="w-full flex-shrink-0">
                  <div className="max-w-2xl mx-auto px-4">
                    <motion.div
                      className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-8 sm:p-10 text-center transition-all duration-300 hover:scale-[1.025] hover:shadow-2xl relative overflow-hidden flex flex-col items-center"
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      {/* Quote Icon */}
                      <svg className={`absolute top-6 ${isRTL ? 'right-6' : 'left-6'} w-10 h-10 text-primary/30 opacity-30`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h.01M15 7h.01M7 11h10M7 15h6" /></svg>
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary shadow-lg border-2 border-primary/30 mb-4">
                        {(review as any).reviewer?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      {/* Name */}
                      <span className="text-lg sm:text-xl font-bold text-white mb-2">{(review as any).reviewer?.name || 'عميل'}</span>
                      {/* Rating */}
                      <div className={`flex items-center justify-center gap-1 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {renderStars(review.rating)}
                      </div>
                      {/* Product badge if available */}
                      {review.product_name && (
                        <span className="inline-block bg-primary/20 text-primary text-xs font-semibold rounded-full px-3 py-1 mb-4">{review.product_name}</span>
                      )}
                      {/* Review Text */}
                      <p className="text-white/90 text-lg sm:text-xl font-medium leading-relaxed mb-6 relative z-10">
                        <span className={`text-primary/80 text-2xl font-bold ${isRTL ? 'ml-2' : 'mr-2'}`}>“</span>
                        {review.comment}
                        <span className={`text-primary/80 text-2xl font-bold ${isRTL ? 'mr-2' : 'ml-2'}`}>”</span>
                      </p>
                      {/* Date */}
                      <span className="inline-block bg-white/20 text-white/70 text-xs font-semibold rounded-full px-4 py-1 mt-auto">
                        {new Date(review.created_at).toLocaleDateString('ar-SA')}
                      </span>
                    </motion.div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Dots Indicator */}
          {reviews.length > 1 && (
            <div className="flex justify-center space-x-2 mt-8">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentSlide ? 'bg-primary' : 'bg-muted'
                  }`}
                  onClick={() => setCurrentSlide(i)}
                />
              ))}
            </div>
          )}

          {/* View More Link */}
          <div className="text-center mt-8">
            <Link href="/reviews">
              <Button variant="outline" className="px-6 py-2">
                {locale === 'ar' ? 'عرض جميع المراجعات' : 'View All Reviews'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
