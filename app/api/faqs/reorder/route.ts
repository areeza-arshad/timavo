import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import FAQ from '@/models/FAQ';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { faqs } = body;
    
    for (const faq of faqs) {
      await FAQ.findByIdAndUpdate(faq.id, { order: faq.order });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 });
  }
}