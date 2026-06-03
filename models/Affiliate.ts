import mongoose from 'mongoose';

const AffiliateSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  socialUsername: { 
    type: String 
  },
  easypaisaNumber: { 
    type: String 
  },
  referralCode: { 
    type: String, 
    unique: true,
    sparse: true,  
    index: { unique: true, sparse: true }
  },
  commissionRate: { 
    type: Number, 
    default: 9 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  totalEarnings: { 
    type: Number, 
    default: 0 
  },
  totalSales: { 
    type: Number, 
    default: 0 
  },
  paidEarnings: { 
    type: Number, 
    default: 0 
  },
  pendingEarnings: { 
    type: Number, 
    default: 0 
  },
  approvedAt: { 
    type: Date 
  },
}, { 
  timestamps: true 
});

export default mongoose.models.Affiliate || mongoose.model('Affiliate', AffiliateSchema);