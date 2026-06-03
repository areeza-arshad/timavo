import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  customerName: { 
    type: String, 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  reviewText: { 
    type: String, 
    required: true 
  },
  productName: { 
    type: String 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  order: { 
    type: Number, 
    default: 0 
  },
}, { 
  timestamps: true 
});

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);