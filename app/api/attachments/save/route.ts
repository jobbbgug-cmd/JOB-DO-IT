import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Attachment from '@/lib/models/Attachment';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { dataUrl, fileName, fileType, fileSize, companyCode } = body;

    if (!dataUrl || !fileName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save attachment to database
    const attachment = await Attachment.create({
      dataUrl,
      fileName,
      fileType,
      fileSize,
      companyCode,
    });

    console.log('Attachment saved:', attachment._id, 'fileName:', fileName);

    return NextResponse.json(
      {
        success: true,
        attachmentId: String(attachment._id),
        fileName: attachment.fileName,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error saving attachment:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to save attachment', message: errorMessage },
      { status: 500 }
    );
  }
}
