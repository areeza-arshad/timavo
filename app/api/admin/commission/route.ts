import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Setting from '@/models/Setting';

export async function GET() {
  await connectDB();
  const setting = await Setting.findOne({ key: 'commission_rate' });
  const rate = setting?.value || 9;
  return NextResponse.json({ rate });
}

export async function PUT(request: Request) {
  await connectDB();
  const { rate } = await request.json();
  
  await Setting.findOneAndUpdate(
    { key: 'commission_rate' },
    { key: 'commission_rate', value: rate },
    { upsert: true }
  );
  
  return NextResponse.json({ success: true, rate });
}