'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; 
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

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
  description: string;
  materials: string[];
  recommendedFor: string[];
  isSale?: boolean;
  isNewArrival?: boolean;
  originalPrice?: number;
  sizes?: string[];
  stock?: number;          
  images?: string[];       
  variants?: Variant[];
}

export default function ProductDetailPage() {
  const params = useParams();  
  const id = params.id as string; 
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) {
        throw new Error('Product not found');
      }
      const data = await res.json();
      setProduct(data);
      if (data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPrice = () => {
    if (selectedVariant?.price) return selectedVariant.price;
    return product?.price || 0;
  };

  const getCurrentImage = () => {
    if (selectedVariant?.images && selectedVariant.images.length > 0) {
      return selectedVariant.images[selectedImage];
    }
    if (product?.images && product.images.length > 0) {
      return product.images[selectedImage];
    }
    return '/placeholder.jpg';
  };

  const getCurrentStock = () => {
    if (selectedVariant) {
      return selectedVariant.stock;
    }
    if (product?.stock !== undefined) {
      return product.stock;
    }
    return 0;
  };

  const handleImageClick = (imageUrl: string) => {
    setModalImage(imageUrl);
    setIsModalOpen(true);
  };

  const handleVariantChange = (variant: Variant) => {
    setSelectedVariant(variant);
    setSelectedImage(0);
  };

  const handleThumbnailClick = (thumb: any) => {
  if (thumb.variant) {
    setSelectedVariant(thumb.variant);
    setSelectedImage(thumb.imageIndex);
  } else {
    setSelectedImage(thumb.imageIndex);
  }
};

  const handleAddToCart = () => {
    if (!product) return;
    
    if (getCurrentStock() === 0) {
      toast.error('This product is sold out');
      return;
    }
    
    const productName = selectedVariant 
      ? `${product.name} (${selectedVariant.color})`
      : product.name;
    
    addItem({
      productId: product._id,
      name: productName,
      price: getCurrentPrice(),
      quantity: quantity,
      image: getCurrentImage() || '/placeholder.jpg',
      selectedSize: selectedSize,
    });
    
    toast.success(`Added ${quantity} x ${productName} to cart`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-charcoal">Loading...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <p className="text-charcoal mb-4">Product not found</p>
          <button 
            onClick={() => window.location.href = '/shop'} 
            className="btn-primary"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const currentImage = getCurrentImage();
  const currentPrice = getCurrentPrice();
  const currentStock = getCurrentStock();
  const isSoldOut = currentStock === 0;

  const allThumbnails = (() => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.flatMap((variant, variantIdx) =>
        variant.images.map((img, imgIdx) => ({
          image: img,
          variant: variant,
          variantIndex: variantIdx,
          imageIndex: imgIdx,
          color: variant.color
        }))
      );
    } else if (product.images && product.images.length > 0) {
      return product.images.map((img, idx) => ({
        image: img,
        variant: null,
        variantIndex: 0,
        imageIndex: idx,
        color: 'Main'
      }));
    }
    return [];
  })();

  return (
    <>
      <div className="min-h-screen bg-sand/20 pt-32 pb-24">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-4 md:gap-0 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className='md:px-4'
            >
              <div 
                className="overflow-hidden bg-white cursor-pointer rounded-lg"
                onClick={() => handleImageClick(currentImage)}
              >
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              {allThumbnails.length > 1 && (
                <div className="flex gap-2 sm:gap-3 mt-4 overflow-x-auto pb-2 scrollbar-thin">
                  {allThumbnails.map((thumb, idx) => {
                    const isActive = selectedImage === thumb.imageIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (thumb.variant) {
                            setSelectedVariant(thumb.variant);
                          }
                          setSelectedImage(thumb.imageIndex);
                        }}
                        className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden border-2 rounded-lg transition-all ${
                          isActive 
                            ? 'border-gold shadow-md' 
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                        title={thumb.color}
                      >
                        <img 
                          src={thumb.image} 
                          alt={`View ${idx + 1}`} 
                          className="w-full h-full object-cover" 
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className='md:mr-4'
            >
              <div className="flex gap-2 mb-4">
                {product.isSale && (
                  <span className="bg-dark text-white px-2 py-0.5 text-xs rounded">Sale</span>
                )}
                {isSoldOut && (
                  <span className="bg-gold text-dark px-2 py-0.5 text-xs rounded">Sold Out</span>
                )}
              </div>

              <h1 className="text-4xl font-serif mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-3 mb-6">
                {product.originalPrice && !selectedVariant?.price && (
                  <span className="text-xl text-charcoal line-through">
                    PKR {product.originalPrice}
                  </span>
                )}
                <p className="text-3xl text-gold">PKR {currentPrice}</p>
              </div>
              
              <div className="text-sm mb-6">
                <p className="text-charcoal">{product.description}</p>
              </div>

              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-serif mb-2">Available Colors</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((variant, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleVariantChange(variant)}
                        className={`px-4 py-2 border rounded text-sm transition ${
                          selectedVariant?.color === variant.color
                            ? 'border-gold bg-gold/10 text-gold'
                            : 'border-sand/60 hover:border-gold text-dark'
                        }`}
                      >
                        {variant.color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.materials && product.materials.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-serif mb-2">Materials</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.materials.map((material, idx) => (
                      <span key={idx} className="px-3 py-1 bg-sand/40 text-dark text-sm">
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product.recommendedFor && product.recommendedFor.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-serif mb-2">Recommended For</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.recommendedFor.map((tone, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gold/10 text-sm capitalize">
                        {tone} skin tone
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product.sizes && product.sizes.length > 0 && !isSoldOut && (
                <div className="mb-6">
                  <h3 className="font-serif font-medium mb-2">Please select size</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-5 py-2 border rounded-md text-sm transition-all duration-200 ${
                          selectedSize === size
                            ? 'border-gold bg-gold text-dark'
                            : 'border-sand/40 hover:border-gold text-dark'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {selectedSize && (
                    <p className="text-xs text-gold mt-2">Selected: {selectedSize}</p>
                  )}
                </div>
              )}

              {!isSoldOut ? (
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-sm text-charcoal mb-2">Quantity</label>
                    <div className="flex border border-sand/40 w-32">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 hover:bg-sand/30"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center py-2">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-4 py-2 hover:bg-sand/30"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="w-full border border-gold text-gold py-3 rounded hover:bg-sand/30 transition-all duration-300 font-medium tracking-wide"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={async () => {
                      if (!product) return;
                      
                      if (getCurrentStock() === 0) {
                        toast.error('This product is sold out');
                        return;
                      }
                      
                      const productName = selectedVariant 
                        ? `${product.name} (${selectedVariant.color})`
                        : product.name;
                      
                      // ✅ First, get current cart
                      const currentCart = useCartStore.getState().items;
                      console.log('Current cart length:', currentCart.length);
                      
                      // ✅ Check if item already exists
                      const existingItemIndex = currentCart.findIndex(
                        item => item.productId === product._id && item.selectedSize === selectedSize
                      );
                      
                      let newItems = [...currentCart];
                      
                      if (existingItemIndex !== -1) {
                        // Update existing item quantity
                        newItems[existingItemIndex].quantity += quantity;
                      } else {
                        // Add new item
                        newItems.push({
                          productId: product._id,
                          name: productName,
                          price: currentPrice,
                          quantity: quantity,
                          image: currentImage,
                          selectedSize: selectedSize,
                        });
                      }
                      
                      // ✅ Update store directly
                      useCartStore.setState({ items: newItems });
                      
                      // ✅ Verify
                      const updatedCart = useCartStore.getState().items;
                      console.log('Updated cart length:', updatedCart.length);
                      
                      if (updatedCart.length > 0) {
                        toast.success(`Added ${quantity} x ${productName} to cart`);
                        // ✅ Redirect to checkout
                        window.location.href = '/cart';
                      } else {
                        toast.error('Failed to add to cart');
                      }
                    }}
                    className="w-full bg-gold text-white py-3 rounded hover:bg-gold/90 transition-all duration-300 font-medium tracking-wide"
                  >
                    Buy It Now
                  </button>
                </div>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 py-3 rounded cursor-not-allowed font-medium tracking-wide"
                >
                  Sold Out
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
            onClick={() => setIsModalOpen(false)}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-[201] text-white hover:text-gold transition"
            >
              <XMarkIcon className="h-8 w-8" />
            </button>
            
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={modalImage}
              alt="Product"
              className="max-w-[90vw] max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
              Click anywhere to close
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}