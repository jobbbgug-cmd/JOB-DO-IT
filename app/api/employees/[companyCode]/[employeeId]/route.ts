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
    const body = await req.json();

    console.log('API Update Request:', { employeeId, body });

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.userId !== undefined) updateData.userId = body.userId || null;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.permissionLevel !== undefined) updateData.permissionLevel = body.permissionLevel;

    console.log('Update Data:', updateData);

    console.log('Before update - updateData:', updateData);

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    Object.assign(employee, updateData);
    const savedEmployee = await employee.save();

    const response = savedEmployee.toObject();
    console.log('After save - Employee object:', response);

    const finalResponse = {
      ...response,
      isActive: response.isActive !== undefined ? response.isActive : true,
      permissionLevel: response.permissionLevel || 'self',
    };

    console.log('Final Response sent to client:', finalResponse);

    return NextResponse.json(finalResponse);
  } catch (error: any) {
    console.error('Failed to update employee:', error.message || error);
    return NextResponse.json(
      { error: error.message || 'Failed to update employee' },
      { status: 500 }
    );
  }
}
