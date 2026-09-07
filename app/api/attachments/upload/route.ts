import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Attachment from '@/lib/models/Attachment';
import Task from '@/lib/models/Task';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const taskId = formData.get('taskId') as string;
    const companyCode = formData.get('companyCode') as string;

    if (!file || !taskId || !companyCode) {
      return NextResponse.json(
        { error: 'Missing file, taskId, or companyCode' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = file.type || 'application/octet-stream';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Create attachment document
    const attachment = await Attachment.create({
      dataUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      companyCode,
    });

    const attachmentId = String(attachment._id);

    // Add attachment ID to task
    await Task.findByIdAndUpdate(
      taskId,
      { $push: { attachments: attachmentId } },
      { new: true }
    );

    console.log('Attachment uploaded:', file.name, 'ID:', attachmentId);

    return NextResponse.json(
      {
        id: attachmentId,
        dataUrl,
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
