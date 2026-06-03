'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
}

interface Props {
  products: Product[];
  title?: string;
}

export default function ProductCarousel({ products, title }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-charcoal">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {title && (
        <p className="text-center text-gold text-sm mb-6">{title}</p>
      )}
      
      {/* Navigation Buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-lg hover:bg-gold hover:text-white transition"
      >
        ←
      </button>
      
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-6 scroll-smooth hide-scrollbar pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product, idx) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -10 }}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="min-w-[280px] md:min-w-[320px] flex-shrink-0"
          >
            <Link href={`/product/${product._id}`}>
              <div className="group cursor-pointer">
                <div className="relative overflow-hidden bg-white">
                  <img
                    src={product.images?.[0] || '/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredIndex === idx ? 1 : 0 }}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center"
                  >
                    <span className="text-white text-sm tracking-wide">Quick View</span>
                  </motion.div>
                </div>
                <div className="mt-4 text-center">
                  <h3 className="font-serif text-lg">{product.name}</h3>
                  <p className="text-gold mt-1">${product.price}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-lg hover:bg-gold hover:text-white transition"
      >
        →
      </button>
    </div>
  );
}