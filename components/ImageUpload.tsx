'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  onUpload: (url: string, publicId: string) => void;
  currentImage?: string;
  label?: string;
}

export default function ImageUpload({ onUpload, currentImage, label }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || '');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (data.success) {
        onUpload(data.url, data.publicId);
        toast.success('Image uploaded successfully!');
      } else {
        toast.error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Something went wrong');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      
      <div className="flex items-center gap-4">
        {preview && (
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
        <label className={`cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gold transition text-center">
            {uploading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gold"></div>
                <span className="text-sm">Uploading...</span>
              </div>
            ) : (
              <div>
                <svg className="w-8 h-8 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-gray-500">Click to upload</span>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>
      <p className="text-xs text-charcoal">Upload JPG, PNG or GIF (Max 5MB)</p>
    </div>
  );
}