import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import Company from '@/lib/models/Company';
import Employee from '@/lib/models/Employee';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { companyName, companyCode } = await request.json();

    if (!companyName || !companyCode) {
      return NextResponse.json(
        { error: 'Company name and code are required' },
        { status: 400 }
      );
    }

    // ตรวจสอบ authorization
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ยืนยัน token
    const verified = await jwtVerify(token, JWT_SECRET).catch(() => null);
    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // ตรวจสอบ role
    const userId = (verified.payload as any).userId;
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only owners can create companies' },
        { status: 403 }
      );
    }

    // Save company to database
    const existingCompany = await Company.findOne({ companyCode });
    if (existingCompany) {
      return NextResponse.json(
        { error: 'Company code already exists' },
        { status: 400 }
      );
    }

    const company = await Company.create({
      companyCode,
      companyName,
      ownerId: userId,
    });

    // Auto-add owner as employee
    await Employee.create({
      companyCode,
      name: user.name,
      userId: user._id.toString(),
      role: 'เจ้าของ',
      color: user.color || '#0E9384',
      presence: true,
      taskCount: 0,
      tasks: [],
    });

    return NextResponse.json(
      {
        success: true,
        company: {
          id: company._id,
          name: company.companyName,
          code: company.companyCode,
          owner: user.name,
          createdAt: company.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create company error:', error);
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
}
