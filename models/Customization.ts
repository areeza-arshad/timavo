import mongoose from 'mongoose';

const CustomizationSchema = new mongoose.Schema({
  // For logged-in users
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  // For guest users (no signup)
  guestEmail: { 
    type: String 
  },
  guestName: { 
    type: String 
  },
  
  // User Information (for both)
  userName: { 
    type: String, 
    required: true 
  },
  userEmail: { 
    type: String, 
    required: true 
  },
  userPhone: { 
    type: String 
  },
  
  productType: { 
    type: String, 
    enum: ['Ring', 'Necklace', 'Earrings', 'Bracelet', 'Pendant', 'Phone Charms', 'Other'],
    required: true 
  },
  metalType: { 
    type: String, 
    enum: ['Gold', 'Silver'],
    default: 'Gold'
  },
  gemstone: { 
    type: String 
  },
  message: { 
    type: String, 
    required: true 
  },
  
  budget: { 
    type: Number 
  },
  preferredDate: { 
    type: Date 
  },
  
  status: { 
    type: String, 
    enum: ['pending', 'reviewing', 'approved', 'in_progress', 'completed', 'rejected'],
    default: 'pending' 
  },
  adminNotes: { 
    type: String 
  },
  trackingNumber: { 
    type: String 
  },

  referenceImage: {
    type: String,
    default: null
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
});

export default mongoose.models.Customization || mongoose.model('Customization', CustomizationSchema);