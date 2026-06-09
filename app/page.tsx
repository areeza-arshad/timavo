'use client';
import { useEffect, useState } from 'react';
import FeaturedProducts from '@/components/FeaturedProducts';
import BraceletSection from '@/components/BraceletSection';
import CategoriesSection from '@/components/CategoriesSection';
import ReviewSection from '@/components/ReviewSection';
import CustomizePromo from '@/components/CustomizePromo';
import AffiliatePromo from '@/components/AffiliatePromo';
import AboutPage from '@/components/AboutPage';
import FAQSection from '@/components/FAQSection';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon, SparklesIcon } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  stock?: number;
  isSale?: boolean;
  category?: string;
  isFeatured: boolean;
}

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setAllProducts(data);
        const featured = data.filter((p: Product) => p.isFeatured === true);
        setFeaturedProducts(featured.slice(0, 6));
      } else {
        console.error('Expected array but got:', data);
        setAllProducts([]);
        setFeaturedProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setAllProducts([]);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden">
      <section className="hidden relative bg-transparent w-full h-[450px] md:flex min-[1024px]:h-[410px] min-[768px]:h-[300px] items-center justify-center overflow-hidden">
        <img
          src="/bg2.jpeg"
          alt="Hero"
          className="absolute inset-0"
        />
        
        <div className="absolute inset-0 bg-dark/40" />
      </section>
      <section className="md:hidden relative bg-transparent mt-10 w-full h-[160px] flex items-center justify-center overflow-hidden min-[375px]:h-[140px] min-[320px]:h-[130px]">
        <img
          src="/bg2.jpeg"
          alt="Hero"
          className="absolute inset-0 object-cover"
        />
        
        <div className="absolute inset-0 bg-dark/60" />
      </section>

      <div className="bg-sand/30">
        <CategoriesSection />
      </div>
      
      {!loading && featuredProducts.length > 0 && (
        <FeaturedProducts products={featuredProducts} loading={loading} />
      )}

      {!loading && allProducts.length > 0 && (
        <BraceletSection products={allProducts} loading={loading} />
      )}

      <CustomizePromo />

      <AffiliatePromo />

      <AboutPage/>

      <ReviewSection />

      <FAQSection/>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-rose/30 via-sand/20 mx-8 to-plaster/30 rounded-3xl p-8 md:p-12 text-center"
      >
        <h2 className="font-serif text-2xl md:text-3xl text-dark mb-3">
          Ready to Start Your Journey?
        </h2>
        <p className="text-charcoal mb-6 max-w-md mx-auto">
          Explore our collection and find the piece that speaks to your soul.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-gold text-dark px-6 py-3 rounded-full hover:bg-gold/80 transition group"
          >
            <span>Shop Now</span>
            <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition" />
          </Link>
          <Link
            href="/customize"
            className="inline-flex items-center gap-2 border border-dark text-dark px-6 py-3 rounded-full hover:bg-dark hover:text-cream transition group"
          >
            <span>Custom Design</span>
            <SparklesIcon className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>

    </div>
  );
}
