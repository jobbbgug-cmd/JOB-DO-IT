import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Employee from '@/lib/models/Employee';
import Task from '@/lib/models/Task';

export async function GET(req: NextRequest, { params }: { params: Promise<{ companyCode: string }> }) {
  try {
    console.log('GET /api/employees - fetching employees');
    await connectDB();
    const { companyCode } = await params;
    console.log('Fetching employees for companyCode:', companyCode);
    const employees = await Employee.find({ companyCode } as any);
    console.log('Found employees:', employees.length);

    const transformedEmployees = await Promise.all(employees.map(async (emp) => {
      const empObj = emp.toObject ? emp.toObject() : emp;

      // Count total tasks and doing tasks for this employee
      const empId = String(empObj._id);
      const allTasks = await Task.countDocuments({
        companyCode,
        assignees: empId
      });
      const doingTasks = await Task.countDocuments({
        companyCode,
        assignees: empId,
        status: 'in-progress'
      });

      return {
        ...empObj,
        id: empId,
        isActive: empObj.isActive !== undefined ? empObj.isActive : true,
        permissionLevel: empObj.permissionLevel || 'self',
        taskCount: allTasks,
        doingCount: doingTasks,
      };
    }));

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
