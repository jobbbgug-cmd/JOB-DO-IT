import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { companyName, companyCode } = await request.json();

    if (!companyName || !companyCode) {
      return NextResponse.json(
        { error: 'Company name and code are required' },
        { status: 400 }
      );
    }

    // TODO: Save to database
    // For now, just return success
    return NextResponse.json(
      {
        success: true,
        company: {
          id: Math.random().toString(36).substring(7),
          name: companyName,
          code: companyCode,
          owner: 'current-user',
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
}
