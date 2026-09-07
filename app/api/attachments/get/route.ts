import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Attachment from '@/lib/models/Attachment';

export async function POST(req: NextRequest) {
  try {
    console.log('POST /api/attachments/get - request received');
    await connectDB();
    console.log('Database connected');

    const body = await req.json();
    console.log('Request body:', body);
    let { id } = body;

    if (!id) {
      console.error('Missing attachment ID');
      return NextResponse.json({ error: 'Missing attachment ID' }, { status: 400 });
    }

    // Check if id is a dataUrl (old data) - return it directly
    if (typeof id === 'string' && id.startsWith('data:')) {
      console.log('ID is a dataUrl, returning as-is');
      const mimeType = id.split(';')[0].replace('data:', '');
      console.log('Legacy dataUrl mimeType:', mimeType);
      return NextResponse.json({
        id: 'legacy',
        dataUrl: id,
        fileName: 'legacy-file',
        fileType: mimeType,  // This will be "image/jpeg" or "application/pdf" etc
        fileSize: id.length,
      });
    }

    console.log('Fetching attachment with ID:', id);
    const attachment = await Attachment.findById(id);
    console.log('Attachment found:', !!attachment);

    if (!attachment) {
      console.error('Attachment not found:', id);
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    }

    const attachmentObj = attachment.toObject ? attachment.toObject() : attachment;
    console.log('Returning attachment:', { id: attachmentObj._id, fileName: attachmentObj.fileName, fileType: attachmentObj.fileType });

    return NextResponse.json({
      id: String(attachmentObj._id),
      dataUrl: attachmentObj.dataUrl,
      fileName: attachmentObj.fileName,
      fileType: attachmentObj.fileType,
      fileSize: attachmentObj.fileSize,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('❌ Error fetching attachment:', errorMsg);
    console.error('Stack:', errorStack);
    return NextResponse.json(
      {
        error: 'Failed to fetch attachment',
        message: errorMsg,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
      },
      { status: 500 }
    );
  }
}
