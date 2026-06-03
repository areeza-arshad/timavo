'use client';
import { useEffect, useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images?: string[];
  stock?: number; 
  variants: Variant[];
  materials: string[];
  recommendedFor: string[];
  sizes: string[];
  isSale: boolean;
  isNewArrival: boolean;
  isFeatured: boolean;
}

interface Variant {
  color: string;
  images: string[];
  stock: number;
  price?: number;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVariantImage, setUploadingVariantImage] = useState<{ variantIndex: number } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    materials: '',
    recommendedFor: [] as string[],
    sizes: '',
    isSale: false,
    isNewArrival: false,
    isFeatured: false,
  });

  const [variants, setVariants] = useState<Variant[]>([
    { color: '', images: [], stock: 0, price: undefined }
  ]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const addVariant = () => {
    setVariants([...variants, { color: '', images: [], stock: 1, price: undefined }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length === 1) {
      toast.error('At least one color variant is required');
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const updatedVariants = [...variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setVariants(updatedVariants);
  };

  const uploadVariantImage = async (variantIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVariantImage({ variantIndex });
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });
      const data = await res.json();
      
      if (data.success) {
        const updatedVariants = [...variants];
        updatedVariants[variantIndex].images = [...updatedVariants[variantIndex].images, data.url];
        setVariants(updatedVariants);
        toast.success('Image uploaded');
      }
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploadingVariantImage(null);
    }
  };

  const removeVariantImage = (variantIndex: number, imageIndex: number) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].images = updatedVariants[variantIndex].images.filter((_, i) => i !== imageIndex);
    setVariants(updatedVariants);
  };


  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData.name || !formData.price || !formData.category) {
    toast.error('Please fill all required fields');
    return;
  }

  const validVariants = variants.filter(v => v.color && v.images.length > 0);
    if (validVariants.length === 0) {
      toast.error('Please add at least one color variant with images');
      return;
    }

    let slug = formData.slug || formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
    if (!editingProduct) {
      try {
        const checkRes = await fetch(`/api/products/check-slug?slug=${slug}`);
        const checkData = await checkRes.json();
        if (checkData.exists) {
          slug = `${slug}-${Date.now()}`;
        }
      } catch (error) {
        console.error('Error checking slug:', error);
      }
    }

  
    const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    
  
    const allImages: string[] = [];
    variants.forEach(v => {
      if (v.images && v.images.length > 0) {
        allImages.push(...v.images);
      }
    });

    const productData = {
      name: formData.name,
      slug: slug,
      description: formData.description,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      category: formData.category,
      stock: totalStock,  
      images: allImages,  
      variants: variants.map(v => ({
        color: v.color,
        images: v.images,
        stock: v.stock || 0,
        price: v.price ? parseFloat(v.price.toString()) : undefined,
      })),
      materials: formData.materials.split(',').map(m => m.trim()).filter(m => m),
      recommendedFor: formData.recommendedFor,
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s),
      isSale: formData.isSale,
      isNewArrival: formData.isNewArrival,
      isFeatured: formData.isFeatured,
    };

    try {
      const url = editingProduct 
        ? `/api/products?id=${editingProduct._id}` 
        : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (res.ok) {
        const savedProduct = await res.json();
        toast.success(editingProduct ? 'Product updated' : 'Product created');
        setShowModal(false);
        resetForm();
        fetchProducts();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong');
    }
  };

  const handleDelete = (id: string, name: string) => {
    toast((t) => (
      <div className="flex items-center gap-3">
        <span className="text-sm">Delete "{name}"?</span>
        <button
          onClick={async () => {
            toast.dismiss(t.id);
            try {
              const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
              if (res.ok) {
                toast.success('Product deleted');
                fetchProducts();
              } else {
                toast.error('Failed to delete');
              }
            } catch (error) {
              toast.error('Something went wrong');
            }
          }}
          className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
        >
          Yes
        </button>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
        >
          No
        </button>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
    });
  };

  const handleEdit = (product: any) => {
  setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug || '',
      description: product.description || '',
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      category: product.category || '',
      materials: product.materials?.join(', ') || '',
      recommendedFor: product.recommendedFor || [],
      sizes: product.sizes?.join(', ') || '',
      isSale: product.isSale || false,
      isNewArrival: product.isNewArrival || false,
      isFeatured: product.isFeatured || false,
    });
    
    if (product.variants && product.variants.length > 0) {
      setVariants(product.variants.map((v: any) => ({
        color: v.color,
        images: v.images || [],
        stock: v.stock || 1,
        price: v.price || '',
      })));
    }
    
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: '',
      originalPrice: '',
      category: '',
      materials: '',
      recommendedFor: [],
      sizes: '',
      isSale: false,
      isNewArrival: false,
      isFeatured: false,
    });
    setVariants([{ color: '', images: [], stock: 1, price: undefined }]);
  };

  const toggleRecommendedFor = (tone: string) => {
    if (formData.recommendedFor.includes(tone)) {
      setFormData({
        ...formData,
        recommendedFor: formData.recommendedFor.filter(t => t !== tone),
      });
    } else {
      setFormData({
        ...formData,
        recommendedFor: [...formData.recommendedFor, tone],
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-serif">Products Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-gold text-dark px-4 py-2 rounded-lg hover:bg-gold/90 flex items-center gap-2 text-sm"
        >
          <PlusIcon className="h-5 w-5" />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        {/* Desktop Table */}
        <div className="hidden xl:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No products found. Click "Add Product" to create one.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  let productTotalStock = 0;
                  if (product.variants && product.variants.length > 0) {
                    productTotalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
                  } else {
                    productTotalStock = product.stock || 0;
                  }
                  const firstImage = product.variants?.[0]?.images?.[0] || product.images?.[0] || '';
                  
                  return (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {firstImage ? (
                          <img src={firstImage} alt={product.name} className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">PKR {product.price}</td>
                      <td className="px-2 py-2 text-sm">
                        <span className={`px-1 py-1 text-xs rounded-full ${productTotalStock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {productTotalStock > 0 ? `${productTotalStock} in stock` : 'Out of stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{product.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-900 mr-3">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(product._id, product.name)} className="text-red-600 hover:text-red-900">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="xl:hidden divide-y divide-gray-200">
          {products.length === 0 ? (
            <div className="px-4 py-12 text-center text-gray-500">
              No products found. Click "Add Product" to create one.
            </div>
          ) : (
            products.map((product) => {
              let productTotalStock = 0;
              if (product.variants && product.variants.length > 0) {
                productTotalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
              } else {
                productTotalStock = product.stock || 0;
              }
              const firstImage = product.variants?.[0]?.images?.[0] || product.images?.[0]  || '';
              
              return (
                <div key={product._id} className="p-4 hover:bg-gray-50">
                  <div className="flex gap-3">
                    {firstImage ? (
                      <img src={firstImage} alt={product.name} className="w-16 h-16 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-dark text-sm">{product.name}</h3>
                          <p className="text-gold text-sm font-medium mt-1">PKR {product.price}</p>
                          <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(product)} className="text-blue-600">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(product._id, product.name)} className="text-red-600">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${productTotalStock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {productTotalStock > 0 ? `${productTotalStock} in stock` : 'Out of stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-serif">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Info */}
              <div className="">
                <div>
                  <label className="w-full text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-gold bg-white"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sizes (comma separated)</label>
                  <input
                    type="text"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-gold"
                    placeholder="S, M, L, XL"
                  />
                </div>
              </div>

              {/* Product Variants Section */}
              <div className="border-t pt-4 mt-2">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">Add variante</label>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="text-xs bg-gold text-dark px-3 py-1 rounded hover:bg-gold/80"
                  >
                    + Add Color
                  </button>
                </div>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {variants.map((variant, idx) => (
                    <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-medium">Color {idx + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          className="text-red-500 text-xs hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Color Name</label>
                          <input
                            type="text"
                            required
                            value={variant.color}
                            onChange={(e) => updateVariant(idx, 'color', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-gold"
                            placeholder=""
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Stock Quantity</label>
                          <input
                            type="number"
                            value={variant.stock}
                            onChange={(e) => updateVariant(idx, 'stock', parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-gold"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs text-gray-600 mb-1">Price (Optional)</label>
                          <input
                            type="number"
                            value={variant.price || ''}
                            onChange={(e) => updateVariant(idx, 'price', e.target.value ? parseFloat(e.target.value) : undefined)}
                            className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-gold"
                            placeholder="Leave empty for base price"
                          />
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-xs text-gray-600 mb-1">Images for {variant.color || 'this color'}</label>
                        <div className="flex flex-wrap gap-2 py-4">
                          {variant.images.map((img, imgIdx) => (
                            <div key={imgIdx} className="relative">
                              <img src={img} alt="" className="w-12 h-12 object-cover rounded border" />
                              <button
                                type="button"
                                onClick={() => removeVariantImage(idx, imgIdx)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                              >
                                ×
                              </button>
                              {imgIdx === 0 && (
                                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-gold whitespace-nowrap">
                                  Main
                                </span>
                              )}
                              {imgIdx === 1 && (
                                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-gray-400 whitespace-nowrap">
                                  Hover
                                </span>
                              )}
                            </div>
                          ))}
                          <label className={`w-12 h-12 border-2 border-dashed rounded flex items-center justify-center cursor-pointer hover:border-gold ${uploadingVariantImage?.variantIndex === idx ? 'opacity-50' : ''}`}>
                            {uploadingVariantImage?.variantIndex === idx ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gold" />
                            ) : (
                              <PlusIcon className="h-4 w-4 text-gray-400" />
                            )}
                            <input type="file" accept="image/*" onChange={(e) => uploadVariantImage(idx, e)} className="hidden" />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Materials (comma separated)</label>
                <input
                  type="text"
                  value={formData.materials}
                  onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-gold"
                  placeholder=""
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recommended For</label>
                <div className="flex flex-wrap gap-3">
                  {['fair', 'medium', 'dark'].map((tone) => (
                    <label key={tone} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.recommendedFor.includes(tone)}
                        onChange={() => toggleRecommendedFor(tone)}
                        className="rounded text-gold focus:ring-gold focus:outline-none"
                      />
                      <span className="text-sm capitalize">{tone}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 sm:gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isSale}
                    onChange={(e) => setFormData({ ...formData, isSale: e.target.checked })}
                    className="rounded text-gold focus:ring-gold focus:outline-none"
                  />
                  <span className="text-sm">On Sale</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNewArrival}
                    onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                    className="rounded text-gold focus:ring-gold focus:outline-none"
                  />
                  <span className="text-sm">New Arrival</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded text-gold focus:ring-gold focus:outline-none"
                  />
                  <span className="text-sm">Featured Product</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-gold text-dark rounded-lg hover:bg-gold/90"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}