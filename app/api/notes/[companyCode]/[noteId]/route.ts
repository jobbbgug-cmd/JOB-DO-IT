import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Note from '@/lib/models/Note';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ companyCode: string; noteId: string }> }
) {
  try {
    await connectDB();
    const { companyCode, noteId } = await params;
    const { title, content } = await req.json();

    const note = await Note.findByIdAndUpdate(
      noteId,
      { title, content },
      { new: true }
    );

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: note._id.toString(),
      title: note.title,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    });
  } catch (error) {
    console.error('Failed to update note:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ companyCode: string; noteId: string }> }
) {
  try {
    await connectDB();
    const { companyCode, noteId } = await params;

    await Note.findByIdAndDelete(noteId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
