import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Affiliate from '@/models/Affiliate';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json({ valid: false, error: 'No code provided' });
    }

    const affiliate = await Affiliate.findOne({ 
      referralCode: { $regex: new RegExp(`^${code}$`, 'i') },
      status: 'approved'
    });
    
    if (affiliate) {
      return NextResponse.json({ 
        valid: true, 
        affiliateId: affiliate._id,        
        discountPercent: 5,               
        referralCode: affiliate.referralCode,
        affiliate: {
          id: affiliate._id,
          name: affiliate.name,
          code: affiliate.referralCode
        }
      });
    } else {
      return NextResponse.json({ valid: false, error: 'Invalid referral code' });
    }
  } catch (error) {
    console.error('Error validating referral code:', error);
    return NextResponse.json({ valid: false, error: 'Validation failed' });
  }
}