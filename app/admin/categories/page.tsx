'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ImageUpload from '@/components/ImageUpload';

interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
  imagePublicId?: string;
  order: number;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    imagePublicId: '',
    order: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image) {
      toast.error('Please upload an image');
      return;
    }
    
    try {
      const url = editingCategory ? `/api/categories?id=${editingCategory._id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        toast.success(editingCategory ? 'Category updated' : 'Category created');
        setIsModalOpen(false);
        setFormData({ name: '', image: '', imagePublicId: '', order: 0 });
        fetchCategories();
      } else {
        toast.error('Failed to save category');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handleDelete = (id: string, name: string) => {
    toast((t) => (
      <div className="flex items-center gap-3">
        <span className="text-sm">Delete "{name}" category?</span>
        <button
          onClick={async () => {
            toast.dismiss(t.id);
            const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
              toast.success('Category deleted');
              fetchCategories();
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

  const handleImageUpload = (url: string, publicId: string) => {
    setFormData({ ...formData, image: url, imagePublicId: publicId });
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
        <h1 className="text-2xl font-serif">Categories</h1>
        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '', image: '', imagePublicId: '', order: 0 });
            setIsModalOpen(true);
          }}
          className="bg-gold text-dark px-4 py-2 rounded hover:bg-gold/90 w-full sm:w-auto"
        >
          + Add Category
        </button>
      </div>

      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden xl:block bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category._id}>
                <td className="px-6 py-4">
                  <img src={category.image} alt={category.name} className="w-12 h-12 object-cover rounded" />
                </td>
                <td className="px-6 py-4 font-medium">{category.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{category.slug}</td>
                <td className="px-6 py-4">{category.order}</td>
                <td className="px-6 py-4 space-x-2">
                  <button
                    onClick={() => {
                      setEditingCategory(category);
                      setFormData({
                        name: category.name,
                        image: category.image,
                        imagePublicId: category.imagePublicId || '',
                        order: category.order,
                      });
                      setIsModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category._id, category.name)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - Visible only on mobile */}
      <div className="xl:hidden space-y-4">
        {categories.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg">
            No categories found
          </div>
        ) : (
          categories.map((category) => (
            <div key={category._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start gap-4">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-dark truncate">{category.name}</h3>
                  <p className="text-xs text-gray-500 truncate mt-0.5">Slug: {category.slug}</p>
                  <p className="text-xs text-gray-400 mt-1">Order: {category.order}</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    setEditingCategory(category);
                    setFormData({
                      name: category.name,
                      image: category.image,
                      imagePublicId: category.imagePublicId || '',
                      order: category.order,
                    });
                    setIsModalOpen(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category._id, category.name)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal with Image Upload - Mobile Responsive */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-serif mb-4">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <ImageUpload
                onUpload={handleImageUpload}
                currentImage={formData.image}
                label="Category Image"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder=""
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:border-gold"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Slug will be auto-generated from name</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  placeholder="0, 1, 2..."
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:border-gold"
                />
                <p className="text-xs text-gray-400 mt-1">Lower numbers appear first</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  className="bg-gold text-dark py-2 rounded hover:bg-gold/90 sm:flex-1"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="border border-gray-300 py-2 rounded hover:bg-gray-50 sm:flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}