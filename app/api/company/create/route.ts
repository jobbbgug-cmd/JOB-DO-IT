import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Company from '@/lib/models/Company';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await connectDB();
    const { companyName, companyCode } = await request.json();

    if (!companyName || !companyCode) {
      return NextResponse.json(
        { error: 'Company name and code are required' },
        { status: 400 }
      );
    }

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
      ownerId: auth.user!._id.toString(),
    });

    return NextResponse.json(
      {
        success: true,
        company: {
          id: company._id,
          name: company.companyName,
          code: company.companyCode,
          owner: auth.user!.name,
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
