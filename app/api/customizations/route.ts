import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Customization from '@/models/Customization';
import { sendNewRequestNotificationToAdmin, sendCustomizationStatusEmail } from '@/lib/email';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    let query = {};
    if (email) {
      query = { userEmail: email.toLowerCase() };
    }
    
    const customizations = await Customization.find(query).sort({ createdAt: -1 });
    return NextResponse.json(customizations);
  } catch (error) {
    console.error('Error fetching customizations:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { 
      userName, 
      userEmail, 
      userPhone, 
      productType, 
      metalType, 
      gemstone, 
      message, 
      budget, 
      userId,
      referenceImage 
    } = body;

    const customization = await Customization.create({
      userName,
      userEmail: userEmail.toLowerCase(),
      userPhone,
      productType,
      metalType,
      gemstone,
      message,
      budget: budget || undefined,
      userId: userId || undefined,
      referenceImage: referenceImage || null, 
      status: 'pending',
    });
    
    
    await sendNewRequestNotificationToAdmin(
      customization._id.toString(),
      userName,
      userEmail,
      userPhone,
      productType,
      metalType,
      gemstone,
      message,
      budget
    );

    await sendCustomizationStatusEmail(
      userEmail,
      userName,
      customization._id.toString(),
      'pending',
      'Your customization request has been received. Our team will review it and get back to you soon.'
    );
    
    return NextResponse.json(customization, { status: 201 });
  } catch (error) {
    console.error('Error creating customization:', error);
    return NextResponse.json(
      { error: 'Failed to submit request' },
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
    const { status, adminNotes } = body;
    
    const customization = await Customization.findByIdAndUpdate(
      id,
      { status, adminNotes, updatedAt: new Date() },
      { new: true }
    );
    
    if (customization && status) {
      await sendCustomizationStatusEmail(
        customization.userEmail,
        customization.userName,
        customization._id.toString(),
        status,
        adminNotes || ''
      );
    }
    
    return NextResponse.json(customization);
  } catch (error) {
    console.error('Error updating customization:', error);
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}