import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Note from '@/lib/models/Note';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyCode: string }> }
) {
  try {
    await connectDB();
    const { companyCode } = await params;

    const notes = await Note.find({ companyCode }).sort({ updatedAt: -1 }).lean();

    const formattedNotes = notes.map((note: any) => ({
      id: note._id?.toString() || '',
      title: note.title,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }));

    return NextResponse.json(formattedNotes);
  } catch (error) {
    console.error('Failed to fetch notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ companyCode: string }> }
) {
  try {
    await connectDB();
    const { companyCode } = await params;
    const { title, content } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'Note title required' }, { status: 400 });
    }

    const note = await Note.create({
      companyCode,
      title,
      content: content || '',
    });

    return NextResponse.json({
      id: note._id.toString(),
      title: note.title,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    });
  } catch (error) {
    console.error('Failed to create note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
