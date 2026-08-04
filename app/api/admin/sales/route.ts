import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Sale from '@/models/Sale';


const PAKISTAN_OFFSET = 5 * 60 * 60 * 1000;

// GET all sales
export async function GET() {
  try {
    await connectDB();
    const sales = await Sale.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(sales, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json([], { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

// POST create new sale
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    
    const PAKISTAN_OFFSET = 5 * 60 * 60 * 1000;
    const sale = await Sale.create({
      name: body.name,
      discountType: body.discountType,
      discountValue: body.discountValue,
      products: body.products,
      startDate: new Date(startDate.getTime() + PAKISTAN_OFFSET),
      endDate: new Date(endDate.getTime() + PAKISTAN_OFFSET),
      isActive: true
    });
    
    return NextResponse.json(sale, { 
      status: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json({ 
      error: 'Failed to create sale' 
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, name, discountType, discountValue, products, startDate, endDate, isActive } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Sale ID required' }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    const startDatePK = new Date(new Date(startDate).getTime() + PAKISTAN_OFFSET);
    const endDatePK = new Date(new Date(endDate).getTime() + PAKISTAN_OFFSET);
    
    const sale = await Sale.findByIdAndUpdate(
      id,
      {
        name,
        discountType,
        discountValue,
        products,
        startDate: startDatePK,
        endDate: endDatePK,
        isActive: isActive !== undefined ? isActive : true,
      },
      { new: true }
    );
    
    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { 
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    return NextResponse.json(sale, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error updating sale:', error);
    return NextResponse.json({ error: 'Failed to update sale' }, { 
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
