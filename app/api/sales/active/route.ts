import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Sale from '@/models/Sale';

export async function GET() {
  try {
    await connectDB();
    const now = new Date();
    
    const activeSales = await Sale.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });
    
    return NextResponse.json(activeSales);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}