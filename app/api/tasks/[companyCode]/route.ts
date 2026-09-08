import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Task from '@/lib/models/Task';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyCode: string }> }
) {
  try {
    await connectDB();
    const { companyCode } = await params;

    const tasks = await Task.find({ companyCode }).sort({ createdAt: -1 }).lean();

    const formattedTasks = tasks.map((task: any) => ({
      id: task._id?.toString() || '',
      title: task.title,
      description: task.description || null,
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      assignee: task.assignee || null,
      assignees: task.assignees || [],
      createdBy: task.createdBy || null,
      createdAt: task.createdAt || null,
      dueDate: task.dueDate || null,
      attachments: task.attachments || [],
      progress: task.progress || 0,
      lane: task.lane || 'routine',
      startDate: task.startDate || null,
      endDate: task.endDate || null,
    }));

    return NextResponse.json(formattedTasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ companyCode: string }> }
) {
  try {
    await connectDB();
    const { companyCode } = await params;
    const { title, description, status, priority, assignee, assignees, dueDate, progress, lane, startDate, endDate } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'Task title required' }, { status: 400 });
    }

    const task = await Task.create({
      companyCode,
      title,
      description: description || null,
      status: status || 'todo',
      priority: priority || 'medium',
      assignee: assignee || null,
      assignees: assignees || [],
      dueDate: dueDate || null,
      progress: progress || 0,
      lane: lane || 'routine',
      startDate: startDate || null,
      endDate: endDate || null,
    });

    return NextResponse.json({
      success: true,
      task: {
        id: task._id.toString(),
        title: task.title,
        description: task.description || null,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee || null,
        assignees: task.assignees || [],
        createdBy: task.createdBy || null,
        createdAt: task.createdAt || null,
        dueDate: task.dueDate || null,
        progress: task.progress || 0,
        lane: task.lane || 'routine',
        startDate: task.startDate || null,
        endDate: task.endDate || null,
      },
    });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
