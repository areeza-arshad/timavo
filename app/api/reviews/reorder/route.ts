import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { reviews } = await request.json();
    
    for (const review of reviews) {
      await Review.findByIdAndUpdate(review.id, { order: review.order });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering reviews:', error);
    return NextResponse.json(
      { error: 'Failed to reorder reviews' },
      { status: 500 }
    );
  }
}