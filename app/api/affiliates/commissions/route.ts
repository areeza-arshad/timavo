import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AffiliateCommission from '@/models/AffiliateCommission';
import Affiliate from '@/models/Affiliate';
import { sendAffiliateCommissionApprovalEmail, sendAffiliatePaymentEmail } from '@/lib/email';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const affiliateId = searchParams.get('affiliateId');
    
    let query: any = {};
    if (status) query.status = status;
    if (affiliateId) query.affiliateId = affiliateId;
    
    const commissions = await AffiliateCommission.find(query)
      .populate('affiliateId', 'name email referralCode')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(commissions);
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { status } = body;
    
    const commission = await AffiliateCommission.findById(id);
    
    if (!commission) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    const affiliate = await Affiliate.findById(commission.affiliateId);
    
    if (status === 'approved' && commission.status !== 'approved') {
      await sendAffiliateCommissionApprovalEmail(
        affiliate.name,
        affiliate.email,
        commission.commissionAmount,
        commission.orderNumber
      );
    }
    
    if (status === 'paid' && commission.status !== 'paid') {
      await sendAffiliatePaymentEmail(
        affiliate.name,
        affiliate.email,
        commission.commissionAmount,
        commission.orderNumber,
        'EasyPaisa'
      );
      
      await Affiliate.findByIdAndUpdate(commission.affiliateId, {
        $inc: { paidEarnings: commission.commissionAmount }
      });
    }
    
    const updateData: any = { status };
    if (status === 'approved') updateData.approvedAt = new Date();
    if (status === 'paid') updateData.paidAt = new Date();
    
    const updated = await AffiliateCommission.findByIdAndUpdate(id, updateData, { new: true });
    
    return NextResponse.json(updated);
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}