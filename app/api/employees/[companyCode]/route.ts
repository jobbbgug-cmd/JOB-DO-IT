import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Employee from '@/lib/models/Employee';

export async function GET(req: NextRequest, { params }: { params: Promise<{ companyCode: string }> }) {
  try {
    console.log('GET /api/employees - fetching employees');
    await connectDB();
    const { companyCode } = await params;
    console.log('Fetching employees for companyCode:', companyCode);
    const employees = await Employee.find({ companyCode } as any);
    console.log('Found employees:', employees.length);

    const transformedEmployees = employees.map(emp => {
      const empObj = emp.toObject ? emp.toObject() : emp;
      return {
        ...empObj,
        id: String(empObj._id),
        isActive: empObj.isActive !== undefined ? empObj.isActive : true,
        permissionLevel: empObj.permissionLevel || 'self',
      };
    });

    return NextResponse.json(transformedEmployees);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Error fetching employees:', errorMsg, error);
    return NextResponse.json({ error: 'Failed to fetch employees', message: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ companyCode: string }> }) {
  try {
    await connectDB();
    const { companyCode } = await params;
    const body = await req.json();

    const employee = await Employee.create({
      ...body,
      companyCode,
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}
