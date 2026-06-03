import mongoose from 'mongoose';

const ProductVariantSchema = new mongoose.Schema({
  color: { type: String, required: true },
  images: [{ type: String }],
  stock: { type: Number, default: 0 },
  price: { type: Number },
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { 
    type: String, 
    unique: true,
    sparse: true 
  },
  description: String,
  price: Number,
  originalPrice: Number,
  category: String,
  images: [String],
  materials: [String],
  recommendedFor: [String],
  stock: { type: Number, default: 5 },
  isSale: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  sizes: [String],
  variants: [ProductVariantSchema],
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);