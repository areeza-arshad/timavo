import Setting from "@/models/Setting";
import { connectDB } from '@/lib/mongodb';

let cachedRate: number | null = null;

export async function getCurrentCommissionRate(): Promise<number> {
  if (cachedRate !== null) {
    return cachedRate;
  }
  
  await connectDB();
  
  try {
    const setting = await Setting.findOne({ key: 'commission_rate' });
    const rate = setting?.value || 9; // Default 9%
    
    cachedRate = rate;
    
    return rate;
  } catch (error) {
    console.error('Error fetching commission rate:', error);
    return 9; // Fallback to default
  }
}

// Update commission rate (Admin only)
export async function updateCommissionRate(newRate: number): Promise<boolean> {
  await connectDB();
  
  try {
    await Setting.findOneAndUpdate(
      { key: 'commission_rate' },
      { 
        key: 'commission_rate',
        value: newRate,
        description: `Commission rate updated to ${newRate}%`
      },
      { upsert: true, new: true }
    );
    
    cachedRate = null;
    
    return true;
  } catch (error) {
    console.error('Error updating commission rate:', error);
    return false;
  }
}

export async function getCommissionHistory() {
  await connectDB();
  
  const setting = await Setting.findOne({ key: 'commission_rate' });
  
  return {
    currentRate: setting?.value || 9,
    lastUpdated: setting?.updatedAt,
    description: setting?.description
  };
}