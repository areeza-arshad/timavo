'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import FeaturedProducts from '@/components/FeaturedProducts';
import BraceletSection from '@/components/BraceletSection';
import CategoriesSection from '@/components/CategoriesSection';
import ReviewSection from '@/components/ReviewSection';
import CustomizePromo from '@/components/CustomizePromo';
import AffiliatePromo from '@/components/AffiliatePromo';
import AboutPage from '@/components/AboutPage';

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
      <section className="relative w-full h-screen flex items-center justify-center">
        <img
          src="/bg.jpeg"
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-dark/60" />
      </section>

      <div className="bg-sand/30">
        <CategoriesSection />
      </div>
      
      {!loading && featuredProducts.length > 0 && (
        <FeaturedProducts products={featuredProducts} loading={loading} />
      )}

      <AffiliatePromo />

      {!loading && allProducts.length > 0 && (
        <BraceletSection products={allProducts} loading={loading} />
      )}

      <AboutPage/>

      <ReviewSection />

      <CustomizePromo />
    </div>
  );
}
