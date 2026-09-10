import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Company from '@/lib/models/Company';
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
