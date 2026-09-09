import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Attachment from '@/lib/models/Attachment';
import Task from '@/lib/models/Task';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const taskId = formData.get('taskId') as string | null;
    const companyCode = formData.get('companyCode') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Missing file' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = file.type || 'application/octet-stream';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Create attachment document
    const attachmentData: any = {
      dataUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    };

    if (companyCode) {
      attachmentData.companyCode = companyCode;
    }

    const attachment = await Attachment.create(attachmentData);

    const attachmentId = String(attachment._id);

    // Add attachment ID to task if taskId provided
    if (taskId) {
      await Task.findByIdAndUpdate(
        taskId,
        { $push: { attachments: attachmentId } },
        { new: true }
      );
    }

    console.log('Attachment uploaded:', file.name, 'ID:', attachmentId);

    return NextResponse.json(
      {
        id: attachmentId,
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
