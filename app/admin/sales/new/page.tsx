'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  price: number;
}

export default function NewSalePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    discountType: 'percentage',
    discountValue: 10,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedProducts.length === 0) {
      toast.error('Select at least one product');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/admin/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        products: selectedProducts
      }),
    });

    if (res.ok) {
      toast.success('Sale created!');
      router.push('/admin/sales');
    } else {
      toast.error('Failed to create sale');
    }
    setLoading(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-dark">Create New Sale</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sale Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-sm sm:text-base"
            placeholder="e.g., Summer Sale"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
            <select
              value={formData.discountType}
              onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-sm sm:text-base bg-white"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (PKR)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.discountType === 'percentage' ? 'Discount %' : 'Amount (PKR)'}
            </label>
            <input
              type="number"
              required
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="datetime-local"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="datetime-local"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Products</label>
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2 sm:p-3 bg-gray-50">
            {products.map(product => (
              <label 
                key={product._id} 
                className={`flex items-center gap-2 p-2 sm:p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedProducts.includes(product._id) 
                    ? 'bg-gold/10 border border-gold' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product._id)}
                  onChange={() => toggleProduct(product._id)}
                  className="w-4 h-4 text-gold rounded focus:ring-gold"
                />
                <span className="flex-1 text-sm sm:text-base">{product.name}</span>
                <span className="text-xs sm:text-sm text-gold font-medium">PKR {product.price}</span>
              </label>
            ))}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Selected: <span className="font-semibold text-gold">{selectedProducts.length}</span> products
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gold text-dark font-medium py-2 sm:py-3 rounded-lg hover:bg-gold/90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {loading ? 'Creating...' : 'Create Sale'}
        </button>
      </form>
    </div>
  );
}