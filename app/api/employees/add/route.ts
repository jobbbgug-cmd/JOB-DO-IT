import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Employee from '@/lib/models/Employee';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { companyCode, name, role, color } = await req.json();

    if (!companyCode || !name) {
      return NextResponse.json(
        { error: 'ขาดข้อมูลที่จำเป็น' },
        { status: 400 }
      );
    }

    const employee = await Employee.create({
      companyCode,
      name,
      role: role || null,
      color: color || '#0E9384',
    });

    return NextResponse.json(
      { success: true, employee },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Add employee error:', error);
    return NextResponse.json(
      { error: 'เพิ่มพนักงานไม่สำเร็จ' },
      { status: 500 }
    );
  }
}
