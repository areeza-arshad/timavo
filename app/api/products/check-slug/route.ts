import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    if (!slug) {
      return NextResponse.json({ exists: false });
    }
    
    const existingProduct = await Product.findOne({ slug });
    return NextResponse.json({ exists: !!existingProduct });
  } catch (error) {
    return NextResponse.json({ exists: false });
  }
}