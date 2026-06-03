import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true 
  },
  slug: { 
    type: String, 
    required: true,
    unique: true 
  },
  image: { 
    type: String, 
    required: true 
  },
  imagePublicId: {
    type: String,
    required: true
  },
  description: { 
    type: String 
  },
  order: { 
    type: Number, 
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
}, { 
  timestamps: true 
});

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);