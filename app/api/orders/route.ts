import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Affiliate from '@/models/Affiliate';
import AffiliateCommission from '@/models/AffiliateCommission';
import { sendOrderConfirmationEmail, sendAdminOrderNotification, sendAdvancePaymentEmail, sendFullAdvanceOrderEmail, sendRemainingPaymentEmail } from '@/lib/email';
import { getCurrentUser } from '@/lib/auth';
import { getCurrentCommissionRate } from '@/lib/commission';
import { SHIPPING_FEE } from '@/lib/constants';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    let query = {};
    
    if (email) {
      query = { 'customer.email': email.toLowerCase() };
    }
    
    const orders = await Order.find(query).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    const commissionPercentage = await getCurrentCommissionRate();
    const COMMISSION_RATE = commissionPercentage / 100;
    
    console.log(`Using commission rate: ${commissionPercentage}% for order`);
    
    const orderNumber = `TIM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    let affiliate = null;
    let commissionAmount = 0;
    
    const originalSubtotal = body.originalSubtotal || (body.totalAmount - SHIPPING_FEE);
    const discountedSubtotal = body.subtotal || (body.totalAmount - SHIPPING_FEE);
    const discountAmount = body.discountAmount || 0;
    const discountPercent = body.discountPercent || 0;
    
    const order = await Order.create({
      orderNumber,
      customer: {
        name: body.customer.name,
        email: body.customer.email.toLowerCase(),
        phone: body.customer.phone,
        address: body.customer.address,
      },
      items: body.items.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        selectedSize: item.selectedSize || null,
      })),
      originalSubtotal: originalSubtotal,
      subtotal: discountedSubtotal,
      discountAmount: discountAmount,
      discountPercent: discountPercent,
      shippingCost: SHIPPING_FEE,
      totalAmount: body.totalAmount,
      advanceAmount: body.advanceAmount,
      remainingAmount: body.remainingAmount,
      paymentMethod: body.paymentMethod,
      transactionId: body.transactionId,
      paymentScreenshot: body.paymentScreenshot,
      referralCode: body.referralCode,
      orderNote: body.orderNote || null,
      paymentStatus: 'pending',
      status: 'pending',
    });
    
    // Find affiliate and calculate commission on ORIGINAL subtotal
    if (body.referralCode) {
      affiliate = await Affiliate.findOne({ 
        referralCode: body.referralCode.toUpperCase(),
        status: 'approved'
      });
      
      if (affiliate) {
        commissionAmount = originalSubtotal * COMMISSION_RATE;
        
        await Affiliate.findByIdAndUpdate(affiliate._id, {
          $inc: { 
            totalEarnings: commissionAmount,
            pendingEarnings: commissionAmount,
            totalSales: 1 
          }
        });
        
        await AffiliateCommission.create({
          affiliateId: affiliate._id,
          orderId: order._id,
          orderNumber: orderNumber,
          referralCode: body.referralCode.toUpperCase(),
          orderSubtotal: originalSubtotal, 
          commissionAmount: commissionAmount,
          commissionRate: commissionPercentage,
          status: 'pending',
        });
        
        await Order.findByIdAndUpdate(order._id, {
          affiliateId: affiliate._id,
          commissionAmount: commissionAmount,
          commissionRateAtOrder: commissionPercentage 
        });
      } else {
        console.log(`Affiliate not found for referral code: ${body.referralCode}`);
      }
    }
    
    // Send emails
    try {
      await sendAdminOrderNotification(
        orderNumber,
        body.customer.name,
        body.customer.email,
        body.customer.phone,
        body.customer.address,
        body.items,
        body.totalAmount,
        body.advanceAmount,
        body.paymentMethod,
        body.orderNote
      );
      console.log('Admin notification sent for order:', orderNumber);
    } catch (adminEmailError) {
      console.error('Admin notification failed:', adminEmailError);
    }
    
    try {
      const emailResult = await sendOrderConfirmationEmail(
        body.customer.email,
        body.customer.name,
        orderNumber,
        body.customer.address,
        body.totalAmount,
        body.advanceAmount,
        body.items
      );
      
      if (emailResult.success) {
        console.log('Order confirmation email sent to:', body.customer.email);
      } else {
        console.error('Failed to send customer email');
      }
    } catch (emailError) {
      console.error('Customer email error:', emailError);
    }
    
    return NextResponse.json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      commissionRate: commissionPercentage,
      commissionAmount: commissionAmount,
      discountApplied: discountAmount > 0
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { paymentStatus, status } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }
    
    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    const oldPaymentStatus = existingOrder.paymentStatus;
    const orderAmount = existingOrder.totalAmount;
    const isFullAdvanceOrder = orderAmount < 1000;
    
    const updatedOrder = await Order.findByIdAndUpdate(id, body, { new: true });
    
    // Scenario 1: Order < 1000 - Mark as completed (full paid)
    if (isFullAdvanceOrder && paymentStatus === 'completed' && oldPaymentStatus !== 'completed') {
      await sendFullAdvanceOrderEmail(
        existingOrder.customer.email,
        existingOrder.customer.name,
        existingOrder.orderNumber,
        existingOrder.totalAmount
      );
    }
    
    // Scenario 2: Order ≥ 1000 - Mark as advance_paid (50% paid)
    if (!isFullAdvanceOrder && paymentStatus === 'advance_paid' && oldPaymentStatus !== 'advance_paid') {
      await sendAdvancePaymentEmail(
        existingOrder.customer.email,
        existingOrder.customer.name,
        existingOrder.orderNumber,
        existingOrder.advanceAmount,
        existingOrder.remainingAmount
      );
    }
    
    // Scenario 3: Order ≥ 1000 - Mark as completed (remaining 50% paid on delivery)
    if (!isFullAdvanceOrder && paymentStatus === 'completed' && oldPaymentStatus !== 'completed') {
      await sendRemainingPaymentEmail(
        existingOrder.customer.email,
        existingOrder.customer.name,
        existingOrder.orderNumber,
        existingOrder.remainingAmount
      );
    }
    
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}