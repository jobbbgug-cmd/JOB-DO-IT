import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Company from '@/lib/models/Company';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await connectDB();
    const company = await Company.findOne({ ownerId: auth.user!._id.toString() });

    if (!company) {
      return NextResponse.json({ company: null }, { status: 200 });
    }

    return NextResponse.json(
      {
        success: true,
        company: {
          id: company._id,
          code: company.companyCode,
          name: company.companyName,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get my company error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}
