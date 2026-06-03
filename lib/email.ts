import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOrderConfirmationEmail(
  to: string,
  name: string,
  orderNumber: string,
  address: string,
  totalAmount: number,
  advanceAmount: number,
  items: any[]
) {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name} x ${item.quantity}${item.selectedSize ? ` (${item.selectedSize})` : ''}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">PKR ${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #FFF9F5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; }
        .header { background-color: #2C2C2C; text-align: center; padding: 20px; }
        .header h1 { margin: 0; color: black; font-family: Georgia, serif; }
        .content { padding: 30px; }
        .order-info { background-color: #F5F0EB; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { background-color: #F5F0EB; padding: 8px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #eee; }
        .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 15px; padding-top: 10px; border-top: 2px solid #eee; }
        .footer { text-align: center; padding: 15px; font-size: 12px; color: #666; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <p>Dear <strong>${name}</strong>,</p>
          <p>Thank you for your order! We're excited to craft your beautiful jewelry piece.</p>
          
          <div class="order-info">
            <strong>Order #:</strong> ${orderNumber}<br>
            <strong>Date:</strong> ${new Date().toLocaleDateString()}
          </div>
          
          <h3>Order Items:</h3>
          <table>
            <thead>
              <tr><th>Product</th><th style="text-align: right;">Amount</th></tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="total">
            <div>Total Amount: PKR ${totalAmount.toFixed(2)}</div>
            <div style="font-size: 14px; color: #2C2C2C;">Advance to Pay (50%): PKR ${advanceAmount.toFixed(2)}</div>
          </div>
          
          <p><strong>Delivery Address:</strong><br/>${address}</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Timavo. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Timavo" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: `Order Confirmation #${orderNumber}`,
      html: html,
    });
    console.log('Email sent to:', to);
    return { success: true };
  } catch (error) {
    console.error('Email failed:', error);
    return { success: false };
  }
}

// Customization Status Email
export async function sendCustomizationStatusEmail(
  userEmail: string,
  userName: string,
  requestId: string,
  status: string,
  adminNotes: string
) {
  const statusMessages: Record<string, string> = {
    reviewing: 'Under Review',
    approved: 'Approved',
    in_progress: 'In Progress',
    completed: 'Completed',
    rejected: 'Not Approved',
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Customization Update</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #FFF9F5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; }
        .header { background-color: #2C2C2C; text-align: center; padding: 20px; }
        .header h1 { margin: 0; color: black; font-family: Georgia, serif; }
        .content { padding: 30px; }
        .status { color: #C6A43B; font-weight: bold; }
        .notes { background-color: #F5F0EB; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <p>Dear <strong>${userName}</strong>,</p>
          <p>Your customization request <strong>#${requestId.slice(-8)}</strong> status has been updated to: <span class="status">${statusMessages[status] || status}</span></p>
          ${adminNotes ? `<div class="notes"><strong>Message from our team:</strong><br/>${adminNotes}</div>` : ''}
          <p>You can track your request in your account dashboard.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Timavo. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Timavo" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: `Customization Request Update #${requestId.slice(-8)}`,
      html: html,
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// Send admin notification for new order
export async function sendAdminOrderNotification(
  orderNumber: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  customerAddress: string,
  items: any[],
  totalAmount: number,
  advanceAmount: number,
  paymentMethod: string,
  orderNote: string | undefined
) {
  const adminEmail = process.env.ADMIN_EMAIL || 'timavoofficial@gmail.com';
  const adminUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name} x ${item.quantity}${item.selectedSize ? ` (${item.selectedSize})` : ''}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">PKR ${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>New Order #${orderNumber}</title>
      <style>
        body { font-family: 'Montserrat', 'sans-serif'; background-color: #FFF9F5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; }
        .header { background-color: #2C2C2C; text-align: center; padding: 20px; }
        .header h1 { margin: 0; font-family: Georgia, serif; color: white; }
        .content { padding: 20px; }
        .order-info { background-color: #F5F0EB; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { background-color: #F5F0EB; padding: 8px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #eee; }
        .total { font-size: 16px; font-weight: bold; color: #2C2C2C; margin-top: 15px; padding-top: 10px; border-top: 2px solid #eee; }
        .button { display: inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <h1><strong>New order has been placed!</strong></h1>
          
          <div class="order-info">
            <p><strong>Order #:</strong> ${orderNumber}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
            <p><strong>Phone:</strong> ${customerPhone}</p>
            <p><strong>Address:</strong> ${customerAddress}</p>
          </div>
          
          <h3>Order Items:</h3>
          <table>
            <thead>
              <tr><th>Product</th><th style="text-align: right">Amount</th></tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="total">
            <div>Total Amount: PKR ${totalAmount.toFixed(2)}</div>
            <div>Advance to Pay (50%): PKR ${advanceAmount.toFixed(2)}</div>
            <div>Payment Method: ${paymentMethod}</div>
          </div>
          
          ${orderNote ? `<div style="background-color: #FFF9F5; padding: 10px; margin: 15px 0; border-left: 3px solid #C6A43B;">
            <strong> Customer Notes:</strong><br/>${orderNote}
          </div>` : ''}
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="${adminUrl}/admin/orders" class="button">View Order in Admin Panel</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Timavo" <${process.env.GMAIL_USER}>`,
      to: adminEmail,
      subject: `New Order #${orderNumber} from ${customerName}`,
      html: html,
    });
    console.log('Admin notification sent for order:', orderNumber);
    return { success: true };
  } catch (error) {
    console.error('Admin notification failed:', error);
    return { success: false };
  }
}

// Send admin notification for new affiliate signup
export async function sendAffiliateSignupNotification(
  name: string,
  email: string,
  phone: string,
  socialUsername: string,
  easypaisaNumber: string
) {
  const adminEmail = process.env.ADMIN_EMAIL || 'timavoofficial@gmail.com';
  const adminUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>New Affiliate Signup</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #FFF9F5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; }
        .header { background-color: #2C2C2C; text-align: center; padding: 20px; }
        .header h1 { margin: 0; font-family: Georgia, serif; color: white; }
        .header p { color: #C6A43B; margin: 5px 0 0; }
        .content { padding: 20px; }
        .info-box { background-color: #F5F0EB; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .button { display: inline-block; }
        .footer { text-align: center; padding: 15px; font-size: 12px; color: #666; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <h3><strong>A new influencer has applied to join the affiliate program!</strong></h3>
          
          <div class="info-box">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Instagram/TikTok:</strong> ${socialUsername || 'Not provided'}</p>
            <p><strong>EasyPaisa Number:</strong> ${easypaisaNumber}</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="${adminUrl}/admin/affiliates" class="button">View in Admin Panel</a>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Timavo. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Timavo" <${process.env.GMAIL_USER}>`,
      to: adminEmail,
      subject: `New Affiliate Application: ${name}`,
      html: html,
    });
    console.log('Affiliate signup notification sent to admin');
    return { success: true };
  } catch (error) {
    console.error('Affiliate notification failed:', error);
    return { success: false };
  }
}

// Send affiliate approval email to influencer
export async function sendAffiliateApprovalEmail(
  name: string,
  email: string,
  referralCode: string
) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Welcome to Timavo Affiliate Program!</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #FFF9F5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; }
        .header { background-color: #2C2C2C; text-align: center; padding: 20px; }
        .header h1 { margin: 0; font-family: Georgia, serif; color: white; }
        .header p { color: #C6A43B; margin: 5px 0 0; }
        .content { padding: 20px; }
        .code-box { background-color: #F5F0EB; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; }
        .code { font-size: 28px; font-weight: bold; letter-spacing: 2px; color: #C6A43B; font-family: monospace; }
        .button { display: inline-block; }
        .footer { text-align: center; padding: 15px; font-size: 12px; color: #666; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <p>Dear <strong>${name}</strong>,</p>
          
          <h3><strong>Congratulations! Your affiliate application has been approved!</strong></h3>
          
          <p>We're excited to have you on board. You can now start earning commission on every sale you generate.</p>
          
          <div class="code-box">
            <p style="margin: 0 0 5px 0;">Your Unique Referral Code:</p>
            <p class="code">${referralCode}</p>
          </div>
          
          <p><strong>How to use your referral code:</strong></p>
          <ul>
            <li>Share this code with your audience</li>
            <li>Ask them to enter it at checkout</li>
            <li>Earn commission on every purchase</li>
          </ul>
          
          <p style="margin-top: 20px;">You can track your earnings and commissions in your dashboard.</p>
          
          <p>Need help? Contact us at timavoofficial@gmail.com</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Timavo. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Timavo" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Welcome to Timavo Affiliate Program!`,
      html: html,
    });
    console.log('Affiliate approval email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('Affiliate approval email failed:', error);
    return { success: false };
  }
}

export async function sendNewRequestNotificationToAdmin(
  requestId: string,
  userName: string,
  userEmail: string,
  userPhone: string | undefined,
  productType: string,
  metalType: string,
  gemstone: string | undefined,
  message: string,
  budget: number | undefined
) {
  const adminEmail = process.env.ADMIN_EMAIL || 'timavoofficial@gmail.com';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>New Customization Request</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #FFF9F5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; }
        .header { background-color: #2C2C2C; text-align: center; padding: 15px; }
        .header h2 { margin: 0; color: white; }
        .content { padding: 20px; }
        .details { background-color: #F5F0EB; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .button { display: inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Customization Request</h2>
        </div>
        <div class="content">
          <p><strong>Request ID:</strong> ${requestId.slice(-8)}</p>
          <p><strong>Customer:</strong> ${userName} (${userEmail})</p>
          ${userPhone ? `<p><strong>Phone:</strong> ${userPhone}</p>` : ''}
          <p><strong>Product Type:</strong> ${productType}</p>
          <p><strong>Metal Type:</strong> ${metalType}</p>
          ${gemstone ? `<p><strong>Gemstone:</strong> ${gemstone}</p>` : ''}
          ${budget ? `<p><strong>Budget:</strong> PKR ${budget}</p>` : ''}
          <div class="details">
            <strong>Customer's Message:</strong><br/>
            "${message}"
          </div>
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/customizations" class="button">View in Admin Panel</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Timavo" <${process.env.GMAIL_USER}>`,
      to: adminEmail,
      subject: `New Customization Request from ${userName}`,
      html: html,
    });
    console.log('Admin notification sent for customization');
    return { success: true };
  } catch (error) {
    console.error('Admin notification failed:', error);
    return { success: false };
  }
}

// Send affiliate commission approval email
export async function sendAffiliateCommissionApprovalEmail(
  name: string,
  email: string,
  amount: number,
  orderNumber: string
) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Commission Approved - Timavo Affiliate</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #FFF9F5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; }
        .header { background-color: #2C2C2C; text-align: center; padding: 20px; }
        .header h1 { margin: 0; font-family: Georgia, serif; color: white; }
        .header p { color: #C6A43B; margin: 5px 0 0; }
        .content { padding: 30px; }
        .amount-box { background-color: #F5F0EB; text-align: center; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .amount { font-size: 36px; font-weight: bold; color: #C6A43B; }
        .button { display: inline-block; }
        .footer { text-align: center; padding: 15px; font-size: 12px; color: #666; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <p>Dear <strong>${name}</strong>,</p>
          
          <p><strong>Your commission has been approved!</strong></p>
          
          <div class="amount-box">
            <p style="margin: 0 0 5px 0;">Commission Amount:</p>
            <p class="amount">PKR ${amount.toFixed(2)}</p>
            <p style="margin: 10px 0 0 0; font-size: 12px;">For Order: #${orderNumber}</p>
          </div>
          
          <p>This commission is now ready for payout. You will receive the payment shortly.</p>
          
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Payment will be processed soon</li>
            <li>You will receive another email when payment is sent</li>
          </ul>
          
          <p style="margin-top: 20px;">Thank you for being a valued Timavo affiliate!</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Timavo. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Timavo" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Commission Approved - PKR ${amount.toFixed(2)}`,
      html: html,
    });
    console.log('Commission approval email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('Commission approval email failed:', error);
    return { success: false };
  }
}

// Send affiliate payment confirmation email
export async function sendAffiliatePaymentEmail(
  name: string,
  email: string,
  amount: number,
  orderNumber?: string,
  paymentMethod: string = 'EasyPaisa'
) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Received from Timavo</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #FFF9F5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; }
        .header { background-color: #2C2C2C; text-align: center; padding: 20px; }
        .header h1 { margin: 0; font-family: Georgia, serif; color: white; }
        .header p { color: #C6A43B; margin: 5px 0 0; }
        .content { padding: 30px; }
        .amount-box { background-color: #F5F0EB; text-align: center; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .amount { font-size: 36px; font-weight: bold; color: #C6A43B; }
        .button { display: inline-block; }
        .footer { text-align: center; padding: 15px; font-size: 12px; color: #666; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <p>Dear <strong>${name}</strong>,</p>
          
          <p><strong>Great news! Your payment has been processed!</strong></p>
          
          <div class="amount-box">
            <p style="margin: 0 0 5px 0;">Amount Paid:</p>
            <p class="amount">PKR ${amount.toFixed(2)}</p>
            ${orderNumber ? `<p style="margin: 10px 0 0 0; font-size: 12px;">For Order: #${orderNumber}</p>` : ''}
            <p style="margin: 5px 0 0 0; font-size: 12px;">Payment Method: ${paymentMethod}</p>
          </div>
          
          <p>The amount has been sent to your registered EasyPaisa account.</p>
          
          <p><strong>What happens next?</strong></p>
          <ul>
            <li>Check your EasyPaisa/Bank account for the payment</li>
            <li>Continue sharing your referral code to earn more</li>
            <li>Track your earnings in your affiliate dashboard</li>
          </ul>
          
          <p style="margin-top: 20px;">Thank you for being a valued Timavo affiliate!</p>
          
          <p>Need help? Contact us at timavoofficial@gmail.com</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Timavo. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Timavo" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Payment Received - PKR ${amount.toFixed(2)} from Timavo`,
      html: html,
    });
    console.log('Affiliate payment email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('Affiliate payment email failed:', error);
    return { success: false };
  }
}

// 1. Full Advance Order Email (Order < PKR 1000)
export async function sendFullAdvanceOrderEmail(
  to: string,
  name: string,
  orderNumber: string,
  totalAmount: number
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order Confirmed - Timavo</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #FFF9F5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; }
        .header { background-color: #2C2C2C; text-align: center; padding: 20px; }
        .header h1 { margin: 0; font-family: Georgia, serif; color: white; }
        .content { padding: 30px; }
        .amount-box { background-color: #F5F0EB; text-align: center; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .amount { font-size: 36px; font-weight: bold; color: #C6A43B; }
        .footer { text-align: center; padding: 15px; font-size: 12px; color: #666; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <p>Dear <strong>${name}</strong>,</p>
          <h3>Order Confirmed! Full Payment Received</h3>
          <p>Thank you for your full payment of <strong>PKR ${totalAmount.toFixed(2)}</strong> for order <strong>#${orderNumber}</strong>.</p>
          <div class="amount-box">
            <p style="margin: 0;">Total Amount Paid:</p>
            <p class="amount">PKR ${totalAmount.toFixed(2)}</p>
          </div>
          <p>Your order has been confirmed.</p>
          <p>You will receive another notification when your order is ready for shipping.</p>
          <p>Thank you for choosing Timavo!</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Timavo. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Timavo" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: `Order Confirmed - Full Payment Received #${orderNumber}`,
      html: html,
    });
    return { success: true };
  } catch (error) {
    console.error('Email failed:', error);
    return { success: false };
  }
}

// 2. 50% Advance Payment Email (Order ≥ PKR 1000)
export async function sendAdvancePaymentEmail(
  to: string,
  name: string,
  orderNumber: string,
  advanceAmount: number,
  remainingAmount: number
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Advance Payment Received - Timavo</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #FFF9F5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; }
        .header { background-color: #2C2C2C; text-align: center; padding: 20px; }
        .header h1 { margin: 0; font-family: Georgia, serif; color: white; }
        .content { padding: 30px; }
        .amount-box { background-color: #F5F0EB; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .advance { font-size: 36px; font-weight: bold; color: #C6A43B; }
        .remaining { font-size: 20px; color: #2C2C2C; }
        .footer { text-align: center; padding: 15px; font-size: 12px; color: #666; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <p>Dear <strong>${name}</strong>,</p>
          <h3>Advance Payment Received!</h3>
          <p>Thank you for your advance payment for order <strong>#${orderNumber}</strong>.</p>
          <div class="amount-box">
            <p>Advance Paid (50%):</p>
            <p class="advance">PKR ${advanceAmount.toFixed(2)}</p>
            <p style="margin-top: 10px;">Remaining to Pay (on delivery):</p>
            <p class="remaining">PKR ${remainingAmount.toFixed(2)}</p>
          </div>
          <p>Your order has been confirmed.</p>
          <p>Thank you for choosing Timavo!</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Timavo. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Timavo" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: `Advance Payment Received - Order #${orderNumber}`,
      html: html,
    });
    return { success: true };
  } catch (error) {
    console.error('Email failed:', error);
    return { success: false };
  }
}

// 3. Remaining 50% Payment Email (COD payment completed)
export async function sendRemainingPaymentEmail(
  to: string,
  name: string,
  orderNumber: string,
  remainingAmount: number
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Final Payment Received - Order Complete - Timavo</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #FFF9F5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; }
        .header { background-color: #2C2C2C; text-align: center; padding: 20px; }
        .header h1 { margin: 0; font-family: Georgia, serif; color: white; }
        .content { padding: 30px; }
        .amount-box { background-color: #F5F0EB; text-align: center; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .amount { font-size: 36px; font-weight: bold; color: #C6A43B; }
        .footer { text-align: center; padding: 15px; font-size: 12px; color: #666; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <p>Dear <strong>${name}</strong>,</p>
          <h3>Order Complete! Final Payment Received</h3>
          <p>Thank you for your final payment of <strong>PKR ${remainingAmount.toFixed(2)}</strong> for order <strong>#${orderNumber}</strong>.</p>
          <div class="amount-box">
            <p>Final Payment Received:</p>
            <p class="amount">PKR ${remainingAmount.toFixed(2)}</p>
          </div>
          <p>Your order is now complete!</p>
          <p>Thank you for being a valued Timavo customer!</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Timavo. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Timavo" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: `Order Complete - Final Payment Received #${orderNumber}`,
      html: html,
    });
    return { success: true };
  } catch (error) {
    console.error('Email failed:', error);
    return { success: false };
  }
}

export async function sendOrderShippedEmail(
  to: string,
  name: string,
  orderNumber: string,
  items: any[]
) {
  // Generate items HTML
  const itemsHtml = items.map(item => `
    <div style="display: flex; align-items: center; gap: 15px; padding: 10px 0; border-bottom: 1px solid #eee;">
      ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;" />` : ''}
      <div style="flex: 1;">
        <p style="margin: 0; font-weight: bold;">${item.name}</p>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Quantity: ${item.quantity}</p>
        ${item.selectedSize ? `<p style="margin: 0; font-size: 12px; color: #666;">Size: ${item.selectedSize}</p>` : ''}
      </div>
    </div>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Your Order Has Been Shipped - Timavo</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #FFF9F5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; }
        .header { background-color: #2C2C2C; text-align: center; padding: 20px; }
        .header h1 { margin: 0; font-family: Georgia, serif; color: white; }
        .content { padding: 30px; }
        .items-box { background-color: #F5F0EB; border-radius: 10px; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; background-color: #C6A43B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; padding: 15px; font-size: 12px; color: #666; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <p>Dear <strong>${name}</strong>,</p>
          
          <p>Great news! Your order <strong>#${orderNumber}</strong> has been shipped!</p>
          
          <div class="items-box">
            <p style="margin: 0 0 10px 0; font-weight: bold;">Your Order Includes:</p>
            ${itemsHtml}
          </div>

          <p>Estimated delivery: 5-7 business days.</p>
          
          <p style="margin-top: 20px;">Thank you for shopping with Timavo!</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Timavo. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Timavo" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: `Your Order #${orderNumber} Has Been Shipped!`,
      html: html,
    });
    console.log('Order shipped email sent to:', to);
    return { success: true };
  } catch (error) {
    console.error('Order shipped email failed:', error);
    return { success: false };
  }
}