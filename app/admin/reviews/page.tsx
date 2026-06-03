'use client';
import { useEffect, useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

interface Review {
  _id: string;
  customerName: string;
  rating: number;
  reviewText: string;
  productName?: string;
  isActive: boolean;
  order: number;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    rating: 5,
    reviewText: '',
    productName: '',
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      setReviews(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.reviewText) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const url = editingReview 
        ? `/api/reviews?id=${editingReview._id}` 
        : '/api/reviews';
      const method = editingReview ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        toast.success(editingReview ? 'Review updated' : 'Review created');
        setShowModal(false);
        setEditingReview(null);
        setFormData({
          customerName: '',
          rating: 5,
          reviewText: '',
          productName: '',
          isActive: true,
          order: 0,
        });
        fetchReviews();
      } else {
        toast.error('Failed to save review');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handleDelete = (id: string) => {
    toast((t) => (
      <div className="flex items-center gap-3">
        <span className="text-sm">Delete this review?</span>
        <button
          onClick={async () => {
            toast.dismiss(t.id);
            try {
              const res = await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' });
              if (res.ok) {
                toast.success('Review deleted');
                fetchReviews();
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

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= reviews.length) return;
    
    const newReviews = [...reviews];
    const tempOrder = newReviews[index].order;
    newReviews[index].order = newReviews[newIndex].order;
    newReviews[newIndex].order = tempOrder;
    
    [newReviews[index], newReviews[newIndex]] = [newReviews[newIndex], newReviews[index]];
    setReviews(newReviews);
    
    try {
      await fetch('/api/reviews/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews: newReviews.map((r, i) => ({ id: r._id, order: i })) }),
      });
      toast.success('Order updated');
    } catch (error) {
      fetchReviews();
      toast.error('Failed to reorder');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`h-4 w-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-serif">Manage Reviews</h1>
        <button
          onClick={() => {
            setEditingReview(null);
            setFormData({
              customerName: '',
              rating: 5,
              reviewText: '',
              productName: '',
              isActive: true,
              order: reviews.length,
            });
            setShowModal(true);
          }}
          className="bg-gold text-dark px-4 py-2 rounded hover:bg-gold/90 flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <PlusIcon className="h-5 w-5" />
          Add Review
        </button>
      </div>

      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden xl:block bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reviews.map((review, index) => (
              <tr key={review._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReorder(index, 'up')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleReorder(index, 'down')}
                      disabled={index === reviews.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      ↓
                    </button>
                    <span className="ml-2">{index + 1}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {review.customerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderStars(review.rating)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                  {review.reviewText}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {review.productName || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setEditingReview(review);
                      setFormData({
                        customerName: review.customerName,
                        rating: review.rating,
                        reviewText: review.reviewText,
                        productName: review.productName || '',
                        isActive: review.isActive,
                        order: review.order,
                      });
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - Visible only on mobile */}
      <div className="xl:hidden space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg">
            No reviews found
          </div>
        ) : (
          reviews.map((review, index) => (
            <div key={review._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReorder(index, 'up')}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-50 p-1"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleReorder(index, 'down')}
                    disabled={index === reviews.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-50 p-1"
                  >
                    ↓
                  </button>
                  <span className="text-sm text-gray-500 ml-1">Order: {index + 1}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingReview(review);
                      setFormData({
                        customerName: review.customerName,
                        rating: review.rating,
                        reviewText: review.reviewText,
                        productName: review.productName || '',
                        isActive: review.isActive,
                        order: review.order,
                      });
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 p-1"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="mb-2">
                <span className="text-xs text-gray-400">Customer</span>
                <p className="font-medium text-dark">{review.customerName}</p>
              </div>
              
              <div className="mb-2">
                <span className="text-xs text-gray-400">Rating</span>
                <div className="mt-1">{renderStars(review.rating)}</div>
              </div>
              
              <div className="mb-2">
                <span className="text-xs text-gray-400">Review</span>
                <p className="text-sm text-gray-600 mt-1">{review.reviewText}</p>
              </div>

              {review.productName && (
                <div className="mb-2">
                  <span className="text-xs text-gray-400">Product</span>
                  <p className="text-sm text-gray-500">{review.productName}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal - Mobile Responsive */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif">
                {editingReview ? 'Edit Review' : 'Add Review'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-gold focus:border-gold"
                  placeholder="Enter customer name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating *
                </label>
                <select
                  required
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-gold focus:border-gold"
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Star' : 'Stars'}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Text *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.reviewText}
                  onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-gold focus:border-gold"
                  placeholder="Enter review text"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-gold focus:border-gold"
                  placeholder=""
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-gold focus:border-gold"
                  placeholder="0, 1, 2..."
                />
                <p className="text-xs text-gray-400 mt-1">Lower numbers appear first</p>
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-gold focus:ring-gold"
                />
                <span className="text-sm text-gray-700">Active (show on website)</span>
              </label>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition sm:flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gold text-dark rounded-lg hover:bg-gold/90 transition sm:flex-1"
                >
                  {editingReview ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}