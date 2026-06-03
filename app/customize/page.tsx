'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { PlusIcon, Trash2Icon, UploadIcon, ImageIcon } from 'lucide-react';

export default function CustomizePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userPhone: '',
    productType: 'Ring',
    metalType: 'Gold',
    gemstone: '',
    message: '',
    budget: '',
    preferredDate: '',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setFormData(prev => ({
          ...prev,
          userName: data.user.name,
          userEmail: data.user.email,
        }));
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setUploadedUrl(null);
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview(null);
    setUploadedUrl(null);
  };

  const uploadImageToCloudinary = async (): Promise<string | null> => {
    if (!selectedImage) return null;
    
    const formData = new FormData();
    formData.append('file', selectedImage);
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (res.ok) {
        const data = await res.json();
        setUploadedUrl(data.url);
        return data.url;
      } else {
        toast.error('Failed to upload image');
        return null;
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error uploading image');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    let imageUrl: string | null = null;
    
    if (selectedImage) {
      setUploading(true);
      toast.loading('Uploading image...', { id: 'upload' });
      imageUrl = await uploadImageToCloudinary();
      toast.dismiss('upload');
      if (imageUrl) {
        toast.success('Image uploaded');
      }
      setUploading(false);
    }
    
    try {
      const res = await fetch('/api/customizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: user?._id,
          budget: formData.budget ? parseInt(formData.budget) : undefined,
          preferredDate: formData.preferredDate || undefined,
          referenceImage: imageUrl, // Single image
        }),
      });

      if (res.ok) {
        toast.success('Your customization request has been submitted!');
        
        if (!user) {
          const data = await res.json();
          localStorage.setItem('trackingNumber', data._id);
        }
        
        router.push('/customize/thank-you');
      } else {
        toast.error('Failed to submit request');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand/20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand/20 pt-32 pb-24">
      <div className="container-custom max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-light mb-4">
            Design Your Dream Jewelry
          </h1>
          <div className="w-20 h-px bg-gold mx-auto mb-6" />
          <p className="text-charcoal max-w-2xl mx-auto">
            Tell us your vision, and our expert artisans will bring it to life.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white p-6 md:p-8 shadow-sm space-y-6 rounded-2xl"
        >
          <div>
            <h3 className="font-serif text-xl mb-4 text-dark">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-charcoal mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 focus:border-gold outline-none rounded-lg transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-charcoal mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.userEmail}
                  onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 focus:border-gold outline-none rounded-lg transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-charcoal mb-1">Whatsapp contact</label>
                <input
                  type="tel"
                  value={formData.userPhone}
                  onChange={(e) => setFormData({ ...formData, userPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 focus:border-gold outline-none rounded-lg transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-serif text-xl mb-4 text-dark">Design Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-charcoal mb-1">Product Type</label>
                <select
                  required
                  value={formData.productType}
                  onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 focus:border-gold outline-none rounded-lg transition-colors"
                >
                  <option value="Ring">Ring</option>
                  <option value="Necklace">Necklace</option>
                  <option value="Earrings">Earrings</option>
                  <option value="Bracelet">Bracelet</option>
                  <option value="Pendant">Pendant</option>
                  <option value="Other">Phone Charm</option>
                   <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-charcoal mb-1">Metal Type</label>
                <select
                  value={formData.metalType}
                  onChange={(e) => setFormData({ ...formData, metalType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 focus:border-gold outline-none rounded-lg transition-colors"
                >
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-serif text-xl mb-4 text-dark">Reference Image (Optional)</h3>
            {imagePreview && (
              <div className="relative inline-block mb-4">
                <img
                  src={imagePreview}
                  alt="Reference"
                  className="w-40 h-40 object-cover rounded-lg border border-gray-200 shadow-md"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                >
                  <Trash2Icon className="h-4 w-4" />
                </button>
              </div>
            )}

            {!imagePreview && (
              <label className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gold transition-colors bg-sand/10">
                <PlusIcon className="h-5 w-5 text-gold" />
                <span className="text-sm text-charcoal">Upload Reference Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}

            {uploading && (
              <p className="text-xs text-gold mt-2 flex items-center gap-1">
                <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-gold"></span>
                Uploading...
              </p>
            )}
            
            {uploadedUrl && (
              <p className="text-xs text-green-600 mt-2">
                 Image uploaded successfully
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-charcoal mb-1">Your Requirements</label>
            <textarea
              required
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder=""
              className="w-full px-4 py-2 border border-gray-200 focus:border-gold outline-none rounded-lg transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-charcoal mb-1">Preferred Completion Date (Optional)</label>
            <input
              type="date"
              value={formData.preferredDate}
              onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 focus:border-gold outline-none rounded-lg transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-white font-medium py-3 rounded-lg hover:bg-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? (
              uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  Uploading Image...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  Submitting...
                </span>
              )
            ) : (
              'Submit Customization Request'
            )}
          </button>
          {!user && (
            <p className="text-xs text-charcoal text-center mt-4">
              By submitting, you agree to receive email updates about your request.
              <br />
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-gold hover:underline"
              >
                Sign up for an account
              </button>
              {' '}to track all your requests in one place.
            </p>
          )}
        </motion.form>
      </div>
    </div>
  );
}