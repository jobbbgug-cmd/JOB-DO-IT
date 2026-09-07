import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    console.log('Attachment uploaded:', file.name, 'size:', file.size);

    return NextResponse.json(
      {
        success: true,
        attachment: dataUrl,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error uploading attachment:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to upload attachment', message: errorMessage },
      { status: 500 }
    );
  }
}
