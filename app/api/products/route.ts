import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import cloudinary from '@/lib/cloudinary';

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({}).sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    const product = await Product.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Product with this name already exists. Please use a different name.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create product' },
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
    
    const product = await Product.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    const publicIds: string[] = [];
    
    if (product.images && product.images.length > 0) {
      product.images.forEach((url: string) => {
        const publicId = extractPublicIdFromUrl(url);
        if (publicId) publicIds.push(publicId);
      });
    }
    
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((variant: any, idx: number) => {
        if (variant.images && variant.images.length > 0) {
          variant.images.forEach((url: string) => {
            const publicId = extractPublicIdFromUrl(url);
            if (publicId) publicIds.push(publicId);
          });
        }
      });
    }
    
    if (publicIds.length > 0) {
      for (const publicId of publicIds) {
        try {
          
          const result = await cloudinary.uploader.destroy(publicId);
          console.log(`Cloudinary response:`, result);
          
          if (result.result === 'ok') {
            console.log(`Deleted from Cloudinary: ${publicId}`);
          } else {
            console.log(`Failed to delete: ${publicId} - Response: ${result.result}`);
          }
        } catch (error) {
          console.error(`Error deleting ${publicId}:`, error);
        }
      }
    } else {
      console.log('No public IDs found to delete');
    }
    
    await Product.findByIdAndDelete(id);
    
    return NextResponse.json({ 
      success: true, 
      message: `Product "${product.name}" deleted along with ${publicIds.length} images` 
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

function extractPublicIdFromUrl(url: string): string | null {
  try {

    
    if (!url.includes('cloudinary.com')) {
      return null;
    }
    
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) {
      return null;
    }
    
    let path = url.substring(uploadIndex + 8);
    

    if (path.startsWith('v') && path.includes('/')) {
      path = path.substring(path.indexOf('/') + 1);
    }

    const lastDotIndex = path.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      path = path.substring(0, lastDotIndex);
    }
    
    console.log('Extracted public ID:', path);
    return path;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
}