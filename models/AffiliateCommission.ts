import mongoose from 'mongoose';

const AffiliateCommissionSchema = new mongoose.Schema({
  affiliateId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Affiliate',
    required: true 
  },
  orderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order',
    required: true 
  },
  orderNumber: { 
    type: String, 
    required: true 
  },
  referralCode: { 
    type: String, 
    required: true 
  },
  orderSubtotal: { 
    type: Number, 
    required: true 
  },
  commissionAmount: { 
    type: Number, 
    required: true 
  },
  commissionRate: { 
    type: Number, 
    default: 9 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'paid'], 
    default: 'pending' 
  },
  approvedAt: { 
    type: Date 
  },
  paidAt: { 
    type: Date 
  },
}, { 
  timestamps: true 
});

export default mongoose.models.AffiliateCommission || mongoose.model('AffiliateCommission', AffiliateCommissionSchema);