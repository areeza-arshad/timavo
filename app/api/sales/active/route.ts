// app/api/sales/active/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Sale from '@/models/Sale';

export async function GET() {
  try {
    await connectDB();
    const now = new Date();
    const PAKISTAN_OFFSET = 5 * 60 * 60 * 1000;
    const nowPK = new Date(now.getTime() + PAKISTAN_OFFSET);
    
    const activeSales = await Sale.find({
      isActive: true,
      startDate: { $lte: nowPK },
      endDate: { $gte: nowPK }
    });
    
    
    //CORS headers
    return NextResponse.json(activeSales, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error fetching active sales:', error);
    return NextResponse.json([], { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}