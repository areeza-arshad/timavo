import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import FAQ from '@/models/FAQ';

// GET all FAQs
export async function GET() {
  try {
    await connectDB();
    const faqs = await FAQ.find({ isActive: true }).sort({ order: 1 });
    return NextResponse.json(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST create new FAQ
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { question, answer, order } = body;
    
    const faq = await FAQ.create({
      question,
      answer,
      order: order || 0,
      isActive: true,
    });
    
    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to create FAQ' },
      { status: 500 }
    );
  }
}

// PUT update FAQ
export async function PUT(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { question, answer, order, isActive } = body;
    
    const faq = await FAQ.findByIdAndUpdate(
      id,
      { question, answer, order, isActive, updatedAt: new Date() },
      { new: true }
    );
    
    return NextResponse.json(faq);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to update FAQ' },
      { status: 500 }
    );
  }
}

// DELETE FAQ
export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await FAQ.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to delete FAQ' },
      { status: 500 }
    );
  }
}