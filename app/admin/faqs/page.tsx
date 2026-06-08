'use client';

import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminFAQs() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    order: 0,
  });

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const res = await fetch('/api/faqs');
      const data = await res.json();
      setFaqs(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.question || !formData.answer) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      const url = editingFAQ ? `/api/faqs?id=${editingFAQ._id}` : '/api/faqs';
      const method = editingFAQ ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        toast.success(editingFAQ ? 'FAQ updated' : 'FAQ created');
        setShowModal(false);
        setFormData({ question: '', answer: '', order: 0 });
        fetchFAQs();
      } else {
        toast.error('Failed to save FAQ');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handleDelete = (id: string, question: string) => {
    toast((t) => (
      <div className="flex items-center gap-3">
        <span className="text-sm">Delete "{question}"?</span>
        <button
          onClick={async () => {
            toast.dismiss(t.id);
            const res = await fetch(`/api/faqs?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
              toast.success('FAQ deleted');
              fetchFAQs();
            } else {
              toast.error('Failed to delete');
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
    if (newIndex < 0 || newIndex >= faqs.length) return;
    
    const newFaqs = [...faqs];
    const tempOrder = newFaqs[index].order;
    newFaqs[index].order = newFaqs[newIndex].order;
    newFaqs[newIndex].order = tempOrder;
    
    [newFaqs[index], newFaqs[newIndex]] = [newFaqs[newIndex], newFaqs[index]];
    setFaqs(newFaqs);
    
    try {
      await fetch('/api/faqs/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faqs: newFaqs.map((f, i) => ({ id: f._id, order: i })) }),
      });
      toast.success('Order updated');
    } catch (error) {
      fetchFAQs();
      toast.error('Failed to reorder');
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
    <div className="px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif">FAQs Management</h1>
          <p className="text-sm text-charcoal/70 mt-1">Manage frequently asked questions</p>
        </div>
        <button
          onClick={() => {
            setEditingFAQ(null);
            setFormData({ question: '', answer: '', order: faqs.length });
            setShowModal(true);
          }}
          className="bg-gold text-dark px-4 py-2 rounded-lg hover:bg-gold/90 flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <PlusIcon className="h-5 w-5" />
          Add FAQ
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden xl:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Answer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {faqs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No FAQs found. Click "Add FAQ" to create one.
                </td>
              </tr>
            ) : (
              faqs.map((faq, index) => (
                <tr key={faq._id} className="hover:bg-gray-50">
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
                        disabled={index === faqs.length - 1}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        ↓
                      </button>
                      <span className="ml-2">{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                    {faq.question}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                    {faq.answer}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${faq.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {faq.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingFAQ(faq);
                        setFormData({
                          question: faq.question,
                          answer: faq.answer,
                          order: faq.order,
                        });
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(faq._id, faq.question)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


      {/* Mobile Card View */}
      <div className="xl:hidden space-y-4">
        {faqs.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg">
            No FAQs found
          </div>
        ) : (
          faqs.map((faq, index) => (
            <div key={faq._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-2">
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
                    disabled={index === faqs.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    ↓
                  </button>
                  <span className="text-sm text-gray-500">Order: {index + 1}</span>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded-full ${faq.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  {faq.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h3 className="font-medium text-dark text-sm mb-1">{faq.question}</h3>
              <p className="text-xs text-charcoal mb-3 line-clamp-2">{faq.answer}</p>
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    setEditingFAQ(faq);
                    setFormData({
                      question: faq.question,
                      answer: faq.answer,
                      order: faq.order,
                    });
                    setShowModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(faq._id, faq.question)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif">
                {editingFAQ ? 'Edit FAQ' : 'Add FAQ'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-gold focus:border-gold"
                  placeholder="e.g., How long does shipping take?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-gold focus:border-gold"
                  placeholder="Enter detailed answer..."
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
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gold text-dark rounded-lg hover:bg-gold/90 transition"
                >
                  {editingFAQ ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}