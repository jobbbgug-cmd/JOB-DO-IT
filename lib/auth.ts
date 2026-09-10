import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import User from '@/lib/models/User';
import { connectDB } from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

export async function verifyAuth(request: NextRequest) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('token')?.value;
    
    if (!token) {
      return { error: 'Unauthorized', status: 401, user: null };
    }

    const verified = await jwtVerify(token, JWT_SECRET).catch(() => null);
    if (!verified) {
      return { error: 'Invalid token', status: 401, user: null };
    }

    const userId = (verified.payload as any).userId;
    const user = await User.findById(userId);

    if (!user) {
      return { error: 'User not found', status: 404, user: null };
    }

    if (!user.isVerified) {
      return { error: 'Email not verified', status: 403, user: null };
    }

    return { error: null, status: 200, user };
  } catch (error) {
    return { error: 'Auth failed', status: 500, user: null };
  }
}
