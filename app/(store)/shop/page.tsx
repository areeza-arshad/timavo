'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDownIcon, 
  FunnelIcon, 
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  description: string;
  category?: string;
  stock?: number;
  isSale?: boolean;
  isNewArrival?: boolean;
  createdAt?: string;
  recommendedFor?: string[];  
  variants?: {
    color: string;
    colorCode: string;
    images: string[];
    stock: number;
  }[];
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface ActiveSale {
  _id: string;
  name: string;
  discountType: string;
  discountValue: number;
  products: string[];
  startDate: string;
  endDate: string;
}

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryMap, setCategoryMap] = useState<Map<string, string>>(new Map());
  const [activeSales, setActiveSales] = useState<Map<string, ActiveSale>>(new Map());
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [stockStatus, setStockStatus] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');
  const [sortBy, setSortBy] = useState('featured');

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [selectedSkinTone, setSelectedSkinTone] = useState<string>('');

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchActiveSales();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, selectedCategory, selectedSkinTone, priceMin, priceMax, stockStatus, sortBy, activeSales]);

  useEffect(() => {
    if (categoryParam) {
      const categoryName = categoryMap.get(categoryParam) || categoryParam;
      setSelectedCategory(categoryName);
    } else {
      setSelectedCategory('');
    }
  }, [categoryParam, categoryMap]);

  useEffect(() => {
    const skinToneParam = searchParams.get('skinTone');
    if (skinToneParam) {
      setSelectedSkinTone(skinToneParam);
    }
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
      
      const map = new Map();
      data.forEach((cat: Category) => {
        map.set(cat.slug, cat.name);
      });
      setCategoryMap(map);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchActiveSales = async () => {
    try {
      const res = await fetch('/api/sales/active');
      const data = await res.json();
      const salesMap = new Map();
      data.forEach((sale: ActiveSale) => {
        sale.products.forEach((productId: string) => {
          salesMap.set(productId, sale);
        });
      });
      setActiveSales(salesMap);
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };

  const isProductOutOfStock = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      const totalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      return totalStock === 0;
    }
    return (product.stock || 0) === 0;
  };

  const getProductPrice = (product: Product) => {
    const sale = activeSales.get(product._id);
    if (sale) {
      if (sale.discountType === 'percentage') {
        const salePrice = product.price - (product.price * sale.discountValue / 100);
        return {
          currentPrice: salePrice,
          originalPrice: product.price,
          discountPercent: sale.discountValue
        };
      } else {
        const salePrice = product.price - sale.discountValue;
        return {
          currentPrice: salePrice > 0 ? salePrice : 0,
          originalPrice: product.price,
          discountPercent: Math.round((sale.discountValue / product.price) * 100)
        };
      }
    }
    return {
      currentPrice: product.price,
      originalPrice: null,
      discountPercent: null
    };
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];
    
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.category?.toLowerCase().trim() === selectedCategory.toLowerCase().trim()
      );
    }

  if (selectedSkinTone) {
    filtered = filtered.filter(product => {
      if (!product.recommendedFor || product.recommendedFor.length === 0) return false;
      return product.recommendedFor.some(tone => 
        tone.toLowerCase() === selectedSkinTone.toLowerCase()
      );
    });
  }
    
    if (priceMin !== null) {
      filtered = filtered.filter(product => {
        const { currentPrice } = getProductPrice(product);
        return currentPrice >= priceMin!;
      });
    }
    if (priceMax !== null) {
      filtered = filtered.filter(product => {
        const { currentPrice } = getProductPrice(product);
        return currentPrice <= priceMax!;
      });
    }
    
    if (stockStatus === 'in-stock') {
      filtered = filtered.filter(product => !isProductOutOfStock(product));
    } else if (stockStatus === 'out-of-stock') {
      filtered = filtered.filter(product => isProductOutOfStock(product));
    }
    
    switch (sortBy) {
      case 'price-low-high':
        filtered.sort((a, b) => {
          const priceA = getProductPrice(a).currentPrice;
          const priceB = getProductPrice(b).currentPrice;
          return priceA - priceB;
        });
        break;
      case 'price-high-low':
        filtered.sort((a, b) => {
          const priceA = getProductPrice(a).currentPrice;
          const priceB = getProductPrice(b).currentPrice;
          return priceB - priceA;
        });
        break;
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      default:
        break;
    }
    
    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedSkinTone('');
    setPriceMin(null);
    setPriceMax(null);
    setStockStatus('all');
    setSortBy('featured');
    router.push('/shop');
  };

  const inStockCount = products.filter(p => !isProductOutOfStock(p)).length;
  const outOfStockCount = products.filter(p => isProductOutOfStock(p)).length;

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand/20">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-charcoal">Loading treasures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand/20 pt-32 pb-24">
      <div className="container-custom max-w-7xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-serif font-light mb-3">Our Collection</h1>
          <div className="w-16 h-px bg-gold mx-auto mb-4" />
          <p className="text-charcoal text-sm max-w-md mx-auto">
            Discover our handcrafted jewelry collection
          </p>
        </div>

        <div className="md:hidden flex gap-3 mb-6">
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-sand/30 rounded-full text-sm bg-white flex-1"
          >
            <FunnelIcon className="h-4 w-4" />
            <span>Filter</span>
          </button>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-sand/30 rounded-full text-sm bg-white"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="mb-6 pb-4 border-b border-sand/30">
              <h3 className="font-sans text-dark mb-3">Sort By</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-1 py-2 border border-sand/30 bg-cream text-sm focus:outline-none focus:border-gold"
              >
                <option value="featured">Featured</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            <div className="mb-6 pb-4 border-b border-sand/30">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex justify-between items-center w-full font-sans text-dark mb-3"
              >
                <span>Categories</span>
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCategoryOpen && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === ''}
                      onChange={() => setSelectedCategory('')}
                      className="w-4 h-4 text-gold"
                    />
                    <span className="text-sm text-charcoal">All Products</span>
                    <span className="text-xs text-gray-400 ml-auto">({products.length})</span>
                  </label>
                  {categories.map((cat) => (
                    <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat.name}
                        onChange={() => setSelectedCategory(cat.name)}
                        className="w-4 h-4 text-gold"
                      />
                      <span className="text-sm text-charcoal capitalize">{cat.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-6 pb-4 border-b border-sand/30">
              <button
                onClick={() => setIsPriceOpen(!isPriceOpen)}
                className="flex justify-between items-center w-full font-sans text-dark mb-3"
              >
                <span>Price (PKR)</span>
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${isPriceOpen ? 'rotate-180' : ''}`} />
              </button>
              {isPriceOpen && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceMin ?? ''}
                      onChange={(e) => setPriceMin(e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-gray-200 bg-white text-sm rounded focus:outline-none focus:border-gold"
                    />
                    <span className="text-charcoal">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceMax ?? ''}
                      onChange={(e) => setPriceMax(e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-gray-200 bg-white text-sm rounded focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6 pb-4 border-b border-sand/30">
              <h3 className="font-sans text-dark mb-3">Availability</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="stock"
                    checked={stockStatus === 'in-stock'}
                    onChange={() => setStockStatus('in-stock')}
                    className="w-4 h-4 text-gold"
                  />
                  <span className="text-sm text-charcoal">In Stock</span>
                  <span className="text-xs text-gray-400 ml-auto">({inStockCount})</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="stock"
                    checked={stockStatus === 'out-of-stock'}
                    onChange={() => setStockStatus('out-of-stock')}
                    className="w-4 h-4 text-gold"
                  />
                  <span className="text-sm text-charcoal">Out of Stock</span>
                  <span className="text-xs text-gray-400 ml-auto">({outOfStockCount})</span>
                </label>
              </div>
            </div>

            {(selectedCategory || priceMin !== null || priceMax !== null || stockStatus !== 'all') && (
              <button
                onClick={clearFilters}
                className="text-sm text-gold hover:underline w-full text-center py-2"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {currentProducts.length === 0 ? (
              <div className="text-center py-16 bg-sand/30 rounded-lg">
                <p className="text-charcoal text-lg mb-4">No products found.</p>
                <button onClick={clearFilters} className="text-gold hover:underline">
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {currentProducts.map((product, idx) => {
                    const { currentPrice, originalPrice, discountPercent } = getProductPrice(product);
                    const hasSale = activeSales.has(product._id);
                    const outOfStock = isProductOutOfStock(product);
                    
                    return (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -5 }}
                      >
                        <Link href={`/product/${product._id}`} className="block">
                          <div className="bg-rose rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="relative aspect-square overflow-hidden bg-sand/20">
                              <img
                                src={product.images?.[0] || (product.variants?.[0]?.images?.[0]) || '/placeholder.jpg'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                              
                              {hasSale && !outOfStock && (
                                <div className="absolute bottom-2 left-2 z-10">
                                  <div className="bg-gold text-white text-xs font-bold px-2 py-1 rounded-md">
                                    {discountPercent}% OFF
                                  </div>
                                </div>
                              )}
                              
                              {outOfStock && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <span className="bg-gold text-dark px-3 py-1 rounded-full text-sm font-medium">
                                    Sold Out
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="p-3 text-center">
                              <h3 className="font-serif text-dark text-sm md:text-base mb-1 line-clamp-1 group-hover:text-gold transition">
                                {product.name}
                              </h3>
                              
                              <div className="flex flex-col items-center justify-center">
                                <div className="flex items-center justify-center gap-2 flex-wrap">
                                  {hasSale && !outOfStock ? (
                                    <>
                                      <span className="text-gold font-bold text-sm md:text-base">
                                        PKR {Math.round(currentPrice).toLocaleString()}
                                      </span>
                                      <span className="text-xs text-gray-400 line-through">
                                        PKR {originalPrice?.toLocaleString()}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-gold font-bold text-sm md:text-base">
                                      PKR {currentPrice.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-full border border-gray-200 disabled:opacity-50 hover:bg-white transition"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    
                    <div className="flex gap-1">
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => setCurrentPage(pageNumber)}
                              className={`w-8 h-8 rounded-full text-sm transition ${
                                currentPage === pageNumber
                                  ? 'bg-dark text-white'
                                  : 'hover:bg-white'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                          return <span key={pageNumber} className="px-1 text-gray-400">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-full border border-gray-200 disabled:opacity-50 hover:bg-white transition"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsFilterDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 md:hidden overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-sand/30 p-4 flex justify-between items-center">
                <h2 className="font-serif text-lg">Filters</h2>
                <button 
                  onClick={() => setIsFilterDrawerOpen(false)} 
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5 space-y-6">
                <div>
                  <h3 className="font-serif text-dark mb-2">Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-sand/30 rounded text-sm"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low-high">Price: Low to High</option>
                    <option value="price-high-low">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>

                <div>
                  <h3 className="font-serif text-dark mb-2">Categories</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category-mobile"
                        checked={selectedCategory === ''}
                        onChange={() => {
                          setSelectedCategory('');
                          setIsFilterDrawerOpen(false);
                        }}
                        className="w-4 h-4 text-gold"
                      />
                      <span className="text-sm">All Products</span>
                    </label>
                    {categories.map((cat) => (
                      <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category-mobile"
                          checked={selectedCategory === cat.name}
                          onChange={() => {
                            setSelectedCategory(cat.name);
                            setIsFilterDrawerOpen(false);
                          }}
                          className="w-4 h-4 text-gold"
                        />
                        <span className="text-sm capitalize">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-serif text-dark mb-2">Price (PKR)</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceMin ?? ''}
                      onChange={(e) => setPriceMin(e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-sand/30 rounded text-sm"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceMax ?? ''}
                      onChange={(e) => setPriceMax(e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-sand/30 rounded text-sm"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-serif text-dark mb-2">Availability</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="stock-mobile"
                        checked={stockStatus === 'in-stock'}
                        onChange={() => setStockStatus('in-stock')}
                        className="w-4 h-4 text-gold"
                      />
                      <span className="text-sm">In Stock ({inStockCount})</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="stock-mobile"
                        checked={stockStatus === 'out-of-stock'}
                        onChange={() => setStockStatus('out-of-stock')}
                        className="w-4 h-4 text-gold"
                      />
                      <span className="text-sm">Out of Stock ({outOfStockCount})</span>
                    </label>
                  </div>
                </div>

                {(selectedCategory || priceMin !== null || priceMax !== null || stockStatus !== 'all') && (
                  <button
                    onClick={() => {
                      clearFilters();
                      setIsFilterDrawerOpen(false);
                    }}
                    className="w-full py-2.5 text-sm text-gold border border-gold rounded-lg hover:bg-gold/10 transition mt-4"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function SuspenseFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sand/20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <ShopContent />
    </Suspense>
  );
}