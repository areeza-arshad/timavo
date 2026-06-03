import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  orderNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
  },
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true },
  }],
  totalAmount: { type: Number, required: true },
  advanceAmount: { type: Number, required: true },
  remainingAmount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['easypaisa', 'bank_transfer'], 
    required: true 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'advance_paid', 'completed'], 
    default: 'pending' 
  },
  transactionId: { type: String },
  paymentScreenshot: { type: String },
  referralCode: { type: String },
  commission: { type: Number },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  affiliateId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Affiliate' 
  },
  commissionAmount: { 
    type: Number, 
    default: 0 
  },
  commissionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AffiliateCommission' 
  },
subtotal: { 
  type: Number, 
  required: true 
},
shippingCost: { 
  type: Number, 
  required: true 
},
}, { 
  timestamps: true 
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);