import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Sale from '@/models/Sale';


export async function GET() {
  try {
    await connectDB();
    const sales = await Sale.find({}).sort({ createdAt: -1 });
    return NextResponse.json(sales);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    const sale = await Sale.create({
      name: body.name,
      discountType: body.discountType,
      discountValue: body.discountValue,
      products: body.products,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      isActive: true
    });
    
    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create sale' }, { status: 500 });
  }
}