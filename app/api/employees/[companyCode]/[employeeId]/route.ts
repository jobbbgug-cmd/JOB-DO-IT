import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Employee from '@/lib/models/Employee';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ companyCode: string; employeeId: string }> }
) {
  try {
    await connectDB();
    const { companyCode, employeeId } = await params;
    const { userId } = await req.json();

    console.log('Updating employee:', { companyCode, employeeId, userId });

    const employee = await Employee.findByIdAndUpdate(
      employeeId,
      { userId: userId || null },
      { new: true }
    );

    console.log('Update result:', employee);

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error: any) {
    console.error('Failed to update employee:', error.message || error);
    return NextResponse.json(
      { error: error.message || 'Failed to update employee' },
      { status: 500 }
    );
  }
}
