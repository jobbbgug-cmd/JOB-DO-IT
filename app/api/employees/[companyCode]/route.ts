import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Employee from '@/lib/models/Employee';

export async function GET(
  req: NextRequest,
  { params }: { params: { companyCode: string } }
) {
  try {
    await connectDB();
    const employees = await Employee.find({ companyCode: params.companyCode });
    return NextResponse.json(employees);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { companyCode: string } }
) {
  try {
    await connectDB();
    const data = await req.json();

    const employee = new Employee({
      ...data,
      companyCode: params.companyCode,
    });

    await employee.save();
    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}
