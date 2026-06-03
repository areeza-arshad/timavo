import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { 
  sendFullAdvanceOrderEmail, 
  sendAdvancePaymentEmail, 
  sendRemainingPaymentEmail 
} from '@/lib/email';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { paymentStatus } = body;
    
    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    const oldPaymentStatus = existingOrder.paymentStatus;
    const orderAmount = existingOrder.totalAmount;
    const isFullAdvanceOrder = orderAmount < 1000;
    
    const order = await Order.findByIdAndUpdate(
      id,
      { paymentStatus: paymentStatus },
      { new: true }
    );
    
    try {
      // Scenario 1: Order < 1000 - Mark as completed (full advance paid)
      if (isFullAdvanceOrder && paymentStatus === 'completed' && oldPaymentStatus !== 'completed') {
        await sendFullAdvanceOrderEmail(
          existingOrder.customer.email,
          existingOrder.customer.name,
          existingOrder.orderNumber,
          existingOrder.totalAmount
        );
      }
      
      // Scenario 2: Order ≥ 1000 - Mark as advance_paid (50% paid)
      else if (!isFullAdvanceOrder && paymentStatus === 'advance_paid' && oldPaymentStatus !== 'advance_paid') {
        await sendAdvancePaymentEmail(
          existingOrder.customer.email,
          existingOrder.customer.name,
          existingOrder.orderNumber,
          existingOrder.advanceAmount,
          existingOrder.remainingAmount
        );
      }
      
      // Scenario 3: Order ≥ 1000 - Mark as completed (remaining 50% paid)
      else if (!isFullAdvanceOrder && paymentStatus === 'completed' && oldPaymentStatus !== 'completed') {
        await sendRemainingPaymentEmail(
          existingOrder.customer.email,
          existingOrder.customer.name,
          existingOrder.orderNumber,
          existingOrder.remainingAmount
        );
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      { error: 'Failed to update payment status' },
      { status: 500 }
    );
  }
}