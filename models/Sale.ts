import mongoose from 'mongoose';

const SaleSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  discountType: { 
    type: String, 
    enum: ['percentage', 'fixed'],
    default: 'percentage' 
  },
  discountValue: { 
    type: Number, 
    required: true 
  },
  products: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  }],
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true 
});

export default mongoose.models.Sale || mongoose.model('Sale', SaleSchema);