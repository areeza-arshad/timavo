import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Affiliate from '@/models/Affiliate';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ isAffiliate: false });
    }
    
    const affiliate = await Affiliate.findOne({ 
      email: email.toLowerCase(),
      status: 'approved'
    });
    
    return NextResponse.json({ 
      isAffiliate: !!affiliate,
      affiliate: affiliate ? {
        id: affiliate._id,
        name: affiliate.name,
        referralCode: affiliate.referralCode,
        status: affiliate.status
      } : null
    });
  } catch (error) {
    console.error('Error checking affiliate status:', error);
    return NextResponse.json({ isAffiliate: false });
  }
}