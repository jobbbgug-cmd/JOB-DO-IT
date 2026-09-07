import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import mongoose from 'mongoose';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    // Try to find by ObjectId first, if not valid format try find by email/username
    let user;

    if (mongoose.Types.ObjectId.isValid(id)) {
      user = await User.findById(id);
    } else {
      // If not ObjectId, try to find by email or username
      console.log('Not an ObjectId, searching by email:', id);
      user = await User.findOne({ $or: [{ email: id }, { name: id }] });
    }

    if (!user) {
      console.log('User not found:', id);
      return NextResponse.json({ error: 'User not found', message: `No user found for ID: ${id}` }, { status: 404 });
    }

    const userObj = user.toObject ? user.toObject() : user;
    return NextResponse.json({
      id: String(userObj._id),
      name: userObj.name,
      email: userObj.email,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ Error fetching user:', errorMsg);
    return NextResponse.json({ error: 'Failed to fetch user', message: errorMsg }, { status: 500 });
  }
}
