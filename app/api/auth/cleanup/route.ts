import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Delete all users
    const result = await User.deleteMany({});

    return NextResponse.json({
      message: 'All users deleted',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete users' }, { status: 500 });
  }
}
