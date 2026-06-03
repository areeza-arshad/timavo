'use client';
import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, MinusIcon, PlusIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';

interface Variant {
  color: string;
  images: string[];
  stock: number;
  price?: number;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images?: { url: string }[] | string[];
  description?: string;
  sizes?: string[];
  isSale?: boolean;
  stock?: number;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  variants?: Variant[];
}

interface FeaturedProductsProps {
  products: Product[];
  loading?: boolean;
}

export default function FeaturedProducts({ products, loading = false }: FeaturedProductsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const [activeSales, setActiveSales] = useState<Map<string, any>>(new Map());
  const safeProducts = Array.isArray(products) ? products : [];

  const addItemToCart = useCartStore((state) => state.addItem);

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


  const getTotalStock = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    }
    return product.stock || 0;
  };

  const getImageUrl = (product: Product, index: number = 0) => {
    if (product.variants && product.variants.length > 0 && product.variants[0].images.length > 0) {
      return product.variants[0].images[0];
    }
    if (!product.images || product.images.length === 0) {
      return 'https://via.placeholder.com/400';
    }
    const image = product.images[index];
    if (typeof image === 'string') {
      return image;
    }
    return image?.url || 'https://via.placeholder.com/400';
  };


  const getHoverImageUrl = (product: Product) => {
    if (product.variants && product.variants.length > 0 && product.variants[0].images.length > 1) {
      return product.variants[0].images[1];
    }
    if (!product.images || product.images.length < 2) {
      return getImageUrl(product, 0);
    }
    const image = product.images[1];
    if (typeof image === 'string') {
      return image;
    }
    return image?.url || getImageUrl(product, 0);
  };

  const displayProducts = safeProducts
  .filter(product => {
    return product.isFeatured === true;
  })
  .slice(0, 4);

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    
    const totalStock = getTotalStock(selectedProduct);
    if (totalStock === 0) {
      toast.error('This product is sold out');
      return;
    }
    
    const { currentPrice } = getSaleInfo(selectedProduct);
    
    addItemToCart({
      productId: selectedProduct._id,
      name: selectedProduct.name,
      price: currentPrice,
      quantity: quantity,
      image: getImageUrl(selectedProduct, 0),
      selectedSize: selectedSize || undefined,
    });
    
    toast.success(`Added ${quantity} x ${selectedProduct.name} to cart`);
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="py-16 md:py-24 bg-cream">
        <div className="container-custom">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
          </div>
        </div>
      </div>
    );
  }

  if (safeProducts.length === 0) {
    return (
      <div className="py-16 md:py-24 bg-cream">
        <div className="container-custom">
          <div className="text-center py-16">
            <p className="text-charcoal">No featured products yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="py-16 md:py-24 bg-cream">
        <div className="container-custom">
          {/* Section Header */}
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-light text-dark mb-3">
              Featured Collection
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-4" />
            <p className="text-charcoal text-sm max-w-md mx-auto">
              Discover our most cherished pieces, handcrafted just for you
            </p>
          </div>

          {/* Mobile: Horizontal Scroll */}
          {isMobile ? (
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-4 pb-6 scroll-smooth cursor-grab active:cursor-grabbing"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              
              {displayProducts.map((product) => {
                const totalStock = getTotalStock(product);
                const isSoldOut = totalStock === 0;
                const { currentPrice, originalPrice, discountPercent, isOnSale } = getSaleInfo(product);
                
                return (
                  <div
                    key={product._id}
                    className="flex-shrink-0 w-[75%] sm:w-[60%] md:w-[280px] group"
                  >
                    <Link href={`/product/${product._id}`} className="block">
                      <div className="p-2">
                        <div className="overflow-hidden rounded-lg bg-sand/20 shadow-sm">
                          <div className="relative w-full h-[350px] overflow-hidden">
                            <img
                              src={getImageUrl(product, 0)}
                              alt={product.name}
                              className="w-full h-full object-cover transition-all duration-500"
                            />
                            {/* Sale Badge - Dynamic */}
                            {isOnSale && !isSoldOut && (
                              <span className="absolute bottom-3 left-3 bg-gold text-white px-2 py-0.5 text-xs rounded z-10 font-bold">
                                {discountPercent}% OFF
                              </span>
                            )}
                            {/* Old isSale badge fallback */}
                            {product.isNewArrival && !isOnSale && !isSoldOut && (
                              <span className="absolute bottom-3 left-3 bg-dark text-white px-2 py-0.5 text-xs rounded z-10">
                                New Arrival
                              </span>
                            )}
                            {isSoldOut && (
                              <span className="absolute bottom-3 left-3 bg-gold text-dark px-2 py-0.5 text-xs rounded z-10">
                                Sold out
                              </span>
                            )}
                          </div>
                          
                          <div className="p-4 text-center">
                            <h3 className="font-serif text-dark text-base mb-1 capitalize">
                              {product.name}
                            </h3>
                            <div className="flex items-center justify-center gap-2 mb-3">
                              {/* ✅ Sale Price Display */}
                              {isOnSale && originalPrice && (
                                <span className="text-sm text-charcoal line-through">
                                  PKR {Math.round(originalPrice).toLocaleString()}
                                </span>
                              )}
                              {product.originalPrice && !isOnSale && (
                                <span className="text-sm text-charcoal line-through">
                                  PKR {product.originalPrice.toLocaleString()}
                                </span>
                              )}
                              <span className="text-gold font-medium">
                                PKR {Math.round(currentPrice).toLocaleString()}
                              </span>
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedProduct(product);
                                setSelectedSize(product.sizes?.[0] || '');
                                setQuantity(1);
                                setShowModal(true);
                              }}
                              disabled={isSoldOut}
                              className={`w-full border border-dark py-2 rounded transition-all duration-300 text-sm ${
                                isSoldOut 
                                  ? 'border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100' 
                                  : 'text-dark hover:bg-dark hover:text-cream'
                              }`}
                            >
                              {isSoldOut ? 'Sold Out' : 'Quick View'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Desktop: Grid Layout - 4 columns */
            <div className="grid grid-cols-1 md:mx-auto md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {displayProducts.map((product, idx) => {
                const isHovered = hoveredProductId === product._id;
                const mainImage = getImageUrl(product, 0);
                const hoverImage = getHoverImageUrl(product);
                const hasHoverImage = (product.variants && product.variants[0]?.images.length >= 2) || 
                                      (product.images && product.images.length >= 2);
                const totalStock = getTotalStock(product);
                const isSoldOut = totalStock === 0;
                const { currentPrice, originalPrice, discountPercent, isOnSale } = getSaleInfo(product);

                return (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="group"
                    onMouseEnter={() => setHoveredProductId(product._id)}
                    onMouseLeave={() => setHoveredProductId(null)}
                  >
                    <Link href={`/product/${product._id}`} className="block">
                      <div className="p-2">
                        <div className="overflow-hidden rounded-lg bg-sand/20 shadow-md transition-all duration-300">
                          <div className="relative w-full h-[350px] md:h-[380px] overflow-hidden">
                            <img
                              src={mainImage}
                              alt={product.name}
                              className={`w-full h-full object-cover transition-opacity duration-500 ${
                                isHovered && hasHoverImage ? 'opacity-0' : 'opacity-100'
                              }`}
                            />
                            {hasHoverImage && (
                              <img
                                src={hoverImage}
                                alt={`${product.name} - alternate view`}
                                className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 ${
                                  isHovered ? 'opacity-100' : 'opacity-0'
                                }`}
                              />
                            )}
                            {isOnSale && !isSoldOut && (
                              <span className="absolute bottom-3 left-3 bg-gold text-white px-2 py-0.5 text-xs rounded z-10 font-bold">
                                {discountPercent}% OFF
                              </span>
                            )}
                            {product.isNewArrival && !isOnSale && !isSoldOut && (
                              <span className="absolute bottom-3 left-3 bg-dark text-white px-2 py-0.5 text-xs rounded z-10">
                                New Arrival
                              </span>
                            )}
                            {isSoldOut && (
                              <span className="absolute bottom-3 left-3 bg-gold text-dark px-2 py-0.5 text-xs rounded z-10">
                                Sold out
                              </span>
                            )}
                          </div>
                          
                          <div className="p-4 text-center">
                            <h3 className="font-serif text-dark text-lg mb-1 capitalize group-hover:text-gold transition-colors">
                              {product.name}
                            </h3>
                            <div className="flex items-center justify-center gap-2 mb-3">
                              {isOnSale && originalPrice && (
                                <span className="text-sm text-charcoal line-through">
                                  PKR {Math.round(originalPrice).toLocaleString()}
                                </span>
                              )}
                              {product.originalPrice && !isOnSale && (
                                <span className="text-sm text-charcoal line-through">
                                  PKR {product.originalPrice.toLocaleString()}
                                </span>
                              )}
                              <span className="text-gold font-medium text-lg">
                                PKR {Math.round(currentPrice).toLocaleString()}
                              </span>
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedProduct(product);
                                setSelectedSize(product.sizes?.[0] || '');
                                setQuantity(1);
                                setShowModal(true);
                              }}
                              disabled={isSoldOut}
                              className={`w-full border border-dark py-2.5 rounded transition-all duration-300 text-sm tracking-wide ${
                                isSoldOut 
                                  ? 'border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100' 
                                  : 'text-dark hover:bg-gold hover:text-dark hover:border-gold'
                              }`}
                            >
                              {isSoldOut ? 'Sold Out' : 'Quick View'}
                            </button>
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
          <div className="text-center mt-10 md:mt-12">
            <Link
              href="/shop"
              className="inline-block border border-dark text-dark px-8 py-3 hover:bg-dark hover:text-cream transition-all duration-300 text-sm tracking-wide"
            >
              View All Products →
            </Link>
          </div>
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {showModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
          >
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-cream shadow-xl overflow-y-auto max-h-[90vh] w-full max-w-4xl z-[201]"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 z-30 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-dark" />
              </button>

              <div className="flex flex-col md:flex-row gap-8 p-6 md:p-8">
                <div className="flex-shrink-0 md:w-1/2">
                  <div className="relative h-[300px] md:h-[400px] overflow-hidden rounded-lg">
                    <img
                      src={getImageUrl(selectedProduct, 0)}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                    {(() => {
                      const { isOnSale, discountPercent } = getSaleInfo(selectedProduct);
                      if (isOnSale) {
                        return (
                          <span className="absolute top-2 left-2 bg-gold text-dark px-2 py-0.5 text-xs rounded font-bold">
                            {discountPercent}% OFF
                          </span>
                        );
                      }
                      if (selectedProduct.isSale) {
                        return (
                          <span className="absolute top-2 left-2 bg-gold text-dark px-2 py-0.5 text-xs rounded">
                            Sale
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-serif text-dark mb-2">
                    {selectedProduct.name}
                  </h2>

                  <div className="flex items-center gap-2 mb-4">
                    {(() => {
                      const { currentPrice, originalPrice, isOnSale } = getSaleInfo(selectedProduct);
                      if (isOnSale && originalPrice) {
                        return (
                          <>
                            <span className="text-sm text-charcoal line-through">
                              PKR {Math.round(originalPrice).toLocaleString()}
                            </span>
                            <span className="text-2xl font-serif text-gold">
                              PKR {Math.round(currentPrice).toLocaleString()}
                            </span>
                          </>
                        );
                      }
                      if (selectedProduct.originalPrice) {
                        return (
                          <>
                            <span className="text-sm text-charcoal line-through">
                              PKR {selectedProduct.originalPrice.toLocaleString()}
                            </span>
                            <span className="text-2xl font-serif text-gold">
                              PKR {selectedProduct.price.toLocaleString()}
                            </span>
                          </>
                        );
                      }
                      return (
                        <span className="text-2xl font-serif text-gold">
                          PKR {selectedProduct.price.toLocaleString()}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="flex gap-2 mb-4">
                    {(() => {
                      const { isOnSale, discountPercent } = getSaleInfo(selectedProduct);
                      if (isOnSale) {
                        return (
                          <span className="bg-gold text-dark px-2 py-0.5 text-xs rounded font-bold">
                            {discountPercent}% OFF
                          </span>
                        );
                      }
                      if (selectedProduct.isSale) {
                        return (
                          <span className="bg-gold text-dark px-2 py-0.5 text-xs rounded">Sale</span>
                        );
                      }
                      return null;
                    })()}
                    {selectedProduct.isNewArrival && (
                      <span className="bg-gold text-white px-2 py-0.5 text-xs rounded">New</span>
                    )}
                  </div>

                  {selectedProduct.description && (
                    <p className="text-charcoal text-sm mb-4 leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  )}

                  {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm text-dark mb-2">Size</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-4 py-1.5 border rounded text-sm transition-all ${
                              selectedSize === size
                                ? 'border-dark bg-dark text-white'
                                : 'border-gray-300 hover:border-dark'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <label className="block text-sm text-dark mb-2">Quantity</label>
                    <div className="flex border border-gray-300 w-28">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 hover:bg-gray-100"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="flex-1 text-center py-2 text-sm">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-2 hover:bg-gray-100"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Updated Add to Cart button with toast */}
                    <button
                      onClick={handleAddToCart}
                      className="w-full border border-dark text-dark py-3 rounded hover:bg-dark hover:text-cream transition-all duration-300"
                    >
                      Add to Cart
                    </button>
                    <Link
                      href={`/product/${selectedProduct._id}`}
                      className="flex items-center justify-center gap-2 w-full bg-gold text-white py-3 rounded hover:bg-gold/90 transition-all duration-300"
                    >
                      View Full Details
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}