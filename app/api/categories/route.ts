import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';
import cloudinary from '@/lib/cloudinary';

async function generateUniqueSlug(baseName: string, existingId?: string): Promise<string> {
  const baseSlug = baseName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  
  let slug = baseSlug;
  let counter = 1;
  
  let existingCategory = await Category.findOne({ 
    slug, 
    _id: { $ne: existingId as any } 
  });
  
  while (existingCategory) {
    slug = `${baseSlug}-${counter}`;
    existingCategory = await Category.findOne({ 
      slug, 
      _id: { $ne: existingId as any } 
    });
    counter++;
  }
  
  return slug;
}

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true }).sort({ order: 1 });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, image, imagePublicId, description, order } = body;
    
    const uniqueSlug = await generateUniqueSlug(name);
    
    const category = await Category.create({
      name,
      slug: uniqueSlug,
      image,
      imagePublicId,
      description,
      order: order || 0,
    });
    
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Category with this name already exists. Please use a different name.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create category' },
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
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }
    
    const category = await Category.findById(id);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    if (category.imagePublicId) {
      try {
        const result = await cloudinary.uploader.destroy(category.imagePublicId);
        
        if (result.result === 'ok') {
          console.log('Image deleted from Cloudinary:', category.imagePublicId);
        } else {
          console.log('Image not found in Cloudinary or already deleted');
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);
        
      }
    } else {
      console.log('No imagePublicId found for this category');
    }

    await Category.findByIdAndDelete(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
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
    const { name, image, imagePublicId, description, order } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }
    
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    let finalSlug = existingCategory.slug;
    if (name && name !== existingCategory.name) {
      finalSlug = await generateUniqueSlug(name, id);
    }
    
    if (existingCategory.imagePublicId && existingCategory.imagePublicId !== imagePublicId) {
      console.log('Deleting old image from Cloudinary:', existingCategory.imagePublicId);
      try {
        const result = await cloudinary.uploader.destroy(existingCategory.imagePublicId);
        console.log('Cloudinary deletion result:', result);
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);
      }
    }
    
    const category = await Category.findByIdAndUpdate(
      id,
      {
        name,
        slug: finalSlug,
        image,
        imagePublicId,
        description,
        order: order || 0,
      },
      { new: true }
    );
    
    return NextResponse.json(category);
  } catch (error: any) {
    console.error('Error updating category:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Category with this name already exists. Please use a different name.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}