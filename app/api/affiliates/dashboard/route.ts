import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Affiliate from '@/models/Affiliate';
import AffiliateCommission from '@/models/AffiliateCommission';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const code = searchParams.get('code');
    
    let affiliate = null;
    if (email) {
      affiliate = await Affiliate.findOne({ email });
    } else if (code) {
      affiliate = await Affiliate.findOne({ referralCode: code });
    }
    
    if (!affiliate) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
    }
    
    const commissions = await AffiliateCommission.find({ affiliateId: affiliate._id }).sort({ createdAt: -1 });
    
    const totalEarnings = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);
    const pendingEarnings = commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commissionAmount, 0);
    const approvedEarnings = commissions.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.commissionAmount, 0);
    const paidEarnings = commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.commissionAmount, 0);
    
    return NextResponse.json({
      affiliate: {
        id: affiliate._id,
        name: affiliate.name,
        email: affiliate.email,
        referralCode: affiliate.referralCode,
        commissionRate: affiliate.commissionRate,
        status: affiliate.status,
        totalEarnings,
        pendingEarnings,
        approvedEarnings,
        paidEarnings,
        totalSales: affiliate.totalSales,
      },
      commissions,
    });
  } catch (error) {
    console.error('Error fetching affiliate dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}