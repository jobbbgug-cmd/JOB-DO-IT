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
    const { title, content, links, color } = await req.json();

    console.log('🔵 PUT /api/notes - Request data:', { noteId, title, content, links, color });

    const note = await Note.findByIdAndUpdate(
      noteId,
      { $set: { title, content, links, color } },
      { new: true, runValidators: true }
    );

    if (!note) {
      console.log('❌ Note not found:', noteId);
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    console.log('✅ Note after update from DB:', {
      id: note._id.toString(),
      title: note.title,
      content: note.content,
      links: note.links,
      color: note.color
    });

    const response = {
      id: note._id.toString(),
      title: note.title,
      content: note.content,
      links: note.links || '',
      color: note.color || 'rgb(254, 243, 160)',
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };

    console.log('🟢 Response sent to client:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Failed to update note:', error);
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
