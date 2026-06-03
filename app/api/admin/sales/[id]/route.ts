import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Sale from '@/models/Sale';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }  
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    const deletedSale = await Sale.findByIdAndDelete(id);
    
    if (!deletedSale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Sale deleted successfully' });
    
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete sale' }, { status: 500 });
  }
}