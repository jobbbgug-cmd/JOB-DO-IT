import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Company from '@/lib/models/Company';
import Employee from '@/lib/models/Employee';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyCode: string }> }
) {
  const auth = await verifyAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await connectDB();
    const { companyCode } = await params;

    const company = await Company.findOne({ companyCode });
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const userId = auth.user!._id.toString();
    const isOwner = company.ownerId.toString() === userId;

    if (!isOwner) {
      const employee = await Employee.findOne({
        userId,
        companyId: company._id
      });
      if (!employee) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        companyCode: company.companyCode,
        companyName: company.companyName,
        ownerId: company.ownerId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get company error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}
