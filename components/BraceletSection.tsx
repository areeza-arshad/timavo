'use client';
import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  stock?: number;
  isSale?: boolean;
  isNewArrival?: boolean;
  category?: string;
  variants?: {           
    color: string;
    images: string[];
    stock: number;
  }[];
}

interface BraceletSectionProps {
  products: Product[];
  loading?: boolean;
}

export default function BraceletSection({ products, loading = false }: BraceletSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [activeSales, setActiveSales] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchActiveSales();
  }, []);

  const fetchActiveSales = async () => {
    try {
      const res = await fetch('/api/sales/active');
      const data = await res.json();
      const salesMap = new Map();
      data.forEach((sale: any) => {
        sale.products.forEach((productId: string) => {
          salesMap.set(productId, sale);
        });
      });
      setActiveSales(salesMap);
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };

  const getSaleInfo = (product: Product) => {
    const sale = activeSales.get(product._id);
    if (sale) {
      if (sale.discountType === 'percentage') {
        const salePrice = product.price - (product.price * sale.discountValue / 100);
        return {
          currentPrice: salePrice,
          originalPrice: product.price,
          discountPercent: sale.discountValue,
          isOnSale: true
        };
      } else {
        const salePrice = product.price - sale.discountValue;
        return {
          currentPrice: salePrice > 0 ? salePrice : 0,
          originalPrice: product.price,
          discountPercent: Math.round((sale.discountValue / product.price) * 100),
          isOnSale: true
        };
      }
    }
    return {
      currentPrice: product.price,
      originalPrice: product.originalPrice || null,
      discountPercent: null,
      isOnSale: false
    };
  };

  const getImageUrl = (product: Product) => {
    if (product.images && product.images.length > 0 && product.images[0]) {
      return product.images[0];
    }
    
    if (product.variants && product.variants.length > 0 && product.variants[0].images?.length > 0) {
      return product.variants[0].images[0];
    }

  };
  const getTotalStock = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      const totalVariantStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      if (totalVariantStock > 0) return totalVariantStock;
    }
    if (product.stock !== undefined && product.stock !== null) {
      return product.stock;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current || isMobile) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.cursor = 'grabbing';
  };

  const handleMouseLeave = () => {
    if (!scrollContainerRef.current) return;
    setIsDragging(false);
    scrollContainerRef.current.style.cursor = 'grab';
  };

  const handleMouseUp = () => {
    if (!scrollContainerRef.current) return;
    setIsDragging(false);
    scrollContainerRef.current.style.cursor = 'grab';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current || isMobile) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  if (loading) {
    return (
      <section className="py-16 md:py-20 bg-cream">
        <div className="container-custom">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-serif font-light text-dark">Bracelets</h2>
            <div className="w-12 h-px bg-gold mx-auto mt-3" />
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  const braceletProducts = products.filter(
    (p) => p.category?.toLowerCase() === 'bracelets' || p.name?.toLowerCase().includes('bracelet')
  );

  if (braceletProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-20 bg-cream">
      <div className="container-custom">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-serif font-light text-dark">Bracelets</h2>
          <div className="w-12 h-px bg-gold mx-auto mt-3" />
        </div>

        {/* Mobile View */}
        {isMobile ? (
          <div className="grid grid-cols-2 gap-4">
            {braceletProducts.slice(0, 6).map((product, idx) => {
              const { currentPrice, originalPrice, discountPercent, isOnSale } = getSaleInfo(product);
              const totalStock = getTotalStock(product);
              const isSoldOut = totalStock === 0;
              
              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/product/${product._id}`} className="block group">
                    <div className="overflow-hidden rounded-lg bg-sand/20 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-100">
                        <img
                          src={getImageUrl(product)}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute bottom-3 left-3 flex gap-2">
                          {product.isNewArrival && !isSoldOut && (
                            <span className="bg-gold text-dark px-2 py-0.5 text-xs rounded font-medium">
                              New Arrival
                            </span>
                          )}
                          {isOnSale && !isSoldOut && (
                            <span className="bg-red-500 text-white px-2 py-0.5 text-xs rounded font-bold">
                              {discountPercent}% OFF
                            </span>
                          )}
                          {isSoldOut && (
                            <span className="bg-gray-500 text-white px-2 py-0.5 text-xs rounded font-medium">
                              Sold Out
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-3 text-center">
                        <h3 className="font-serif text-dark text-sm md:text-base mb-1 capitalize line-clamp-1">
                          {product.name}
                        </h3>
                        <div className="flex flex-col md:flex-row items-center justify-center md:gap-2">
                          {isOnSale ? (
                            <>
                              <span className="text-gold font-medium text-sm md:text-base">
                                PKR {Math.round(currentPrice).toLocaleString()}
                              </span>
                              <span className="text-[10px] md:text-xs text-charcoal line-through">
                                PKR {Math.round(originalPrice!).toLocaleString()}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-gold font-medium text-sm md:text-base">
                                PKR {product.price.toLocaleString()}
                              </span>
                              {product.originalPrice && (
                                <span className="text-[10px] md:text-xs text-charcoal line-through">
                                  PKR {product.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Desktop View */
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-6 pb-4 md:px-3 scroll-smooth cursor-grab"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              userSelect: 'none',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {braceletProducts.slice(0, 6).map((product, idx) => {
              const { currentPrice, originalPrice, discountPercent, isOnSale } = getSaleInfo(product);
              const totalStock = getTotalStock(product);
              const isSoldOut = totalStock === 0;
              
              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  viewport={{ once: true }}
                  className="flex-shrink-0 w-[280px] group"
                >
                  <Link href={`/product/${product._id}`} className="block">
                    <div className="overflow-hidden rounded-lg bg-sand/20 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="relative w-full h-[350px] overflow-hidden bg-gray-100">
                        <img
                          src={getImageUrl(product)}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute bottom-3 left-3 flex gap-2">
                          {product.isNewArrival && !isOnSale && !isSoldOut && (
                            <span className="bg-gold text-dark px-2 py-0.5 text-xs rounded font-medium">
                              New Arrival
                            </span>
                          )}
                          {isOnSale && !isSoldOut && (
                            <span className="bg-red-500 text-white px-2 py-0.5 text-xs rounded font-bold">
                              {discountPercent}% OFF
                            </span>
                          )}
                          {isSoldOut && (
                            <span className="bg-gray-500 text-white px-2 py-0.5 text-xs rounded font-medium">
                              Sold Out
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-4 text-center">
                        <h3 className="font-serif text-dark text-lg mb-1 capitalize group-hover:text-gold transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-center gap-2">
                         
                          {isOnSale ? (
                            <>
                              <span className="text-sm text-charcoal line-through">
                                PKR {Math.round(originalPrice!).toLocaleString()}
                              </span>
                              <span className="text-gold font-medium text-lg">
                                PKR {Math.round(currentPrice).toLocaleString()}
                              </span>
                            </>
                          ) : (
                            <>
                              {product.originalPrice && (
                                <span className="text-sm text-charcoal line-through">
                                  PKR {product.originalPrice.toLocaleString()}
                                </span>
                              )}
                              <span className="text-gold font-medium text-lg">
                                PKR {product.price.toLocaleString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-8 md:mt-10">
          <Link
            href="/shop?category=bracelets"
            className="inline-block border border-dark text-dark px-6 md:px-8 py-2.5 md:py-3 hover:bg-gold hover:text-dark hover:border-gold transition-all duration-300 text-sm tracking-wide"
          >
            View All Bracelets →
          </Link>
        </div>
      </div>
    </section>
  );
}