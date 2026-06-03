'use client';
import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
}

export default function CategoriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    scrollRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    if (!scrollRef.current) return;
    setIsDragging(false);
    scrollRef.current.style.cursor = 'grab';
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-3xl md:text-5xl font-serif mb-8 text-dark">Shop by Category</div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-serif font-light text-dark mb-3">
            Shop by Category
          </h2>
          <div className="w-16 h-px bg-gold mx-auto" />
        </div>
        
        {/* Mobile Horizontal Scroll */}
        <div 
          ref={scrollRef}
          className="lg:hidden overflow-x-auto scroll-smooth pb-4 cursor-grab active:cursor-grabbing"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            userSelect: 'none'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          <div className="flex gap-4">
            {categories.map((category, idx) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group flex-shrink-0"
              >
                <Link href={`/shop?category=${category.slug}`} className="block">
                  <div className="w-48 bg-sand/20 rounded-lg text-center shadow-md transition-all duration-300 group-hover:shadow-md">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img 
                        src={category.image || 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=200'}
                        alt={category.name}
                        className="h-60 w-48 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-2 text-dark text-lg font-serif tracking-wider py-3 capitalize group-hover:text-gold transition-colors">
                      {category.name}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Desktop Grid View */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-6">
          {categories.map((category, idx) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Link href={`/shop?category=${category.slug}`} className="block">
                <div className="bg-sand/20 rounded-lg overflow-hidden shadow-md transition-all duration-300 group-hover:shadow-md">
                  <div className="relative overflow-hidden h-60 w-full">
                    <img 
                      src={category.image || 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=300'}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2 text-dark text-lg font-serif tracking-wider py-4 capitalize group-hover:text-gold transition-colors">
                    {category.name}
                    <ArrowRightIcon className="hidden xl:block h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="flex items-center justify-center mt-12">
          <Link 
            href="/shop" 
            className="inline-block bg-dark text-cream px-8 py-3 rounded-full hover:bg-gold hover:text-dark transition-all duration-300 text-sm tracking-wide"
          >
            View All Categories
          </Link>
        </div>
      </motion.div>
    </div>
  );
}