'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Review {
  _id: string;
  customerName: string;
  rating: number;
  reviewText: string;
  productName?: string;
  order: number;
}

export default function ReviewSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [direction, setDirection] = useState(0);
  const touchStartX = useRef(0);

  useEffect(() => {
    fetchReviews();
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

  const reviewsToShow = isMobile ? 1 : 3;
  const totalSlides = Math.ceil(reviews.length / reviewsToShow);
  const visibleReviews = reviews.slice(currentIndex, currentIndex + reviewsToShow);

  const nextSlide = () => {
    if (currentIndex + reviewsToShow < reviews.length) {
      setDirection(1);
      setCurrentIndex(currentIndex + reviewsToShow);
    } else {
      setDirection(1);
      setCurrentIndex(0);
    }
  };

  const prevSlide = () => {
    if (currentIndex - reviewsToShow >= 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - reviewsToShow);
    } else {
      setDirection(-1);
      setCurrentIndex(Math.max(0, reviews.length - reviewsToShow));
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${
              i < rating ? 'fill-gold text-gold' : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-serif text-dark mb-3">Hear It From Them</h2>
          <div className="w-12 h-px bg-gold mx-auto" />
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-serif text-dark mb-3">Hear It From Them</h2>
          <div className="w-12 h-px bg-gold mx-auto" />
        </div>
        <div className="text-center py-16">
          <p className="text-charcoal">No reviews yet. Check back soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-sand/20 py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-serif text-dark mb-3">
            Hear It From Them
          </h2>
          <p className="text-charcoal text-sm">
            Real experiences from our valued customers
          </p>
          <div className="w-12 h-px bg-gold mx-auto mt-3" />
        </div>
        <div className="relative">
          <div
            className="overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
                transition={{ duration: 0.3 }}
                className={`grid gap-6 ${
                  isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'
                }`}
              >
                {visibleReviews.map((review, idx) => (
                  <motion.div
                    key={`${currentIndex}-${idx}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-transparent p-6"
                  >
                    <div className="flex justify-center mb-4">
                      {renderStars(review.rating)}
                    </div>

                    <p className="text-dark font-sans text-base text-center leading-relaxed mb-6 italic">
                      "{review.reviewText}"
                    </p>

                    <div className="border-t border-charcoal/20 pt-4 text-center">
                      <p className="font-serif text-gold text-sm capitalize">
                        {review.customerName}
                      </p>
                      {review.productName && (
                        <p className="text-xs text-gold mt-1">
                          Verified Purchase: {review.productName}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>


          <div className='flex justify-center items-center mt-10'>
            <button
              onClick={prevSlide}
              className='text-charcoal hover:text-gold'
              aria-label="Previous reviews"
            >
              <ChevronLeft className="h-9 w-9" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={nextSlide}
              className='text-charcoal hover:text-gold'
              aria-label="Next reviews"
            >
              <ChevronRight className="h-9 w-9" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}