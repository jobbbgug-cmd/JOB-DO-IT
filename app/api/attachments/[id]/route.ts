import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Attachment from '@/lib/models/Attachment';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    const attachment = await Attachment.findById(id);
    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    }

    const attachmentObj = attachment.toObject ? attachment.toObject() : attachment;
    return NextResponse.json({
      id: String(attachmentObj._id),
      dataUrl: attachmentObj.dataUrl,
      fileName: attachmentObj.fileName,
      fileType: attachmentObj.fileType,
      fileSize: attachmentObj.fileSize,
    });
  } catch (error) {
    console.error('Error fetching attachment:', error);
    return NextResponse.json({ error: 'Failed to fetch attachment' }, { status: 500 });
  }
}
