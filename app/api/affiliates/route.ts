import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Affiliate from '@/models/Affiliate';
import { sendAffiliateSignupNotification, sendAffiliateApprovalEmail } from '@/lib/email';
import AffiliateCommission from '@/models/AffiliateCommission';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const status = searchParams.get('status');
    
    let query: any = {};
    if (email) query.email = email;
    if (status) query.status = status;
    
    const affiliates = await Affiliate.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(affiliates);
  } catch (error) {
    console.error('Error fetching affiliates:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, email, phone, socialUsername, easypaisaNumber } = body;
    
    const existing = await Affiliate.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: 'Already applied with this email' },
        { status: 400 }
      );
    }
    
    const affiliate = await Affiliate.create({
      name,
      email,
      phone,
      socialUsername,
      paymentMethod: body.paymentMethod || 'easypaisa',
      easypaisaNumber: body.easypaisaNumber,
      jazzcashNumber: body.jazzcashNumber,
      bankName: body.bankName,
      bankAccountName: body.bankAccountName,
      bankAccountNumber: body.bankAccountNumber,
      bankIBAN: body.bankIBAN,
      status: 'pending',
    });
    
    await sendAffiliateSignupNotification(
      name,
      email,
      phone,
      socialUsername,
      easypaisaNumber
    );
    
    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      affiliate: { id: affiliate._id, name: affiliate.name, status: affiliate.status },
    });
  } catch (error) {
    console.error('Error creating affiliate:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { status, commissionRate } = body;
    
    const existingAffiliate = await Affiliate.findById(id);
    
    if (!existingAffiliate) {
      return NextResponse.json(
        { error: 'Affiliate not found' },
        { status: 404 }
      );
    }
    
    const updateData: any = {};
    if (status) updateData.status = status;
    if (commissionRate) updateData.commissionRate = commissionRate;
    
    let generatedCode = null;
    if (status === 'approved' && existingAffiliate.status !== 'approved') {
      const nameCode = existingAffiliate.name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '');
      const randomNum = Math.floor(Math.random() * 9000) + 1000;
      generatedCode = `${nameCode}${randomNum}`;
      
      let codeExists = await Affiliate.findOne({ referralCode: generatedCode });
      let counter = 1;
      while (codeExists) {
        generatedCode = `${nameCode}${randomNum}${counter}`;
        codeExists = await Affiliate.findOne({ referralCode: generatedCode });
        counter++;
      }
      
      updateData.referralCode = generatedCode;
      updateData.approvedAt = new Date();
    }
    
    const affiliate = await Affiliate.findByIdAndUpdate(id, updateData, { new: true });
    
    if (status === 'approved' && existingAffiliate.status !== 'approved') {
      await sendAffiliateApprovalEmail(
        affiliate.name,
        affiliate.email,
        affiliate.referralCode
      );
    }
    
    return NextResponse.json(affiliate);
  } catch (error) {
    console.error('Error updating affiliate:', error);
    return NextResponse.json(
      { error: 'Failed to update affiliate' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await Affiliate.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting affiliate:', error);
    return NextResponse.json(
      { error: 'Failed to delete affiliate' },
      { status: 500 }
    );
  }
}