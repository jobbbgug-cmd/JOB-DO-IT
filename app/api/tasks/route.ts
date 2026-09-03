import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Task from '@/lib/models/Task';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('teamId');
    const sprintId = searchParams.get('sprintId');
    const companyCode = searchParams.get('companyCode');

    const query: any = {};

    if (companyCode) {
      query.companyCode = companyCode;
    }

    if (teamId) {
      query.sprint = teamId;
    } else if (sprintId) {
      query.sprint = sprintId;
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });

    return NextResponse.json(
      tasks.map((task: any) => ({
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee,
        lane: task.lane,
        progress: task.progress,
        sprint: task.sprint,
        dueDate: task.dueDate,
      }))
    );
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    console.log('Creating task with body:', body);

    const task = await Task.create({
      companyCode: body.companyCode,
      title: body.title,
      description: body.description,
      status: body.status || 'todo',
      priority: body.priority || 'medium',
      assignee: body.assignee,
      dueDate: body.dueDate,
      sprint: body.sprint,
      lane: body.lane || 'routine',
      progress: body.progress || 0,
    });

    console.log('Task created successfully:', task._id);

    return NextResponse.json(
      {
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee,
        lane: task.lane,
        progress: task.progress,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Error creating task:', errorMessage);
    console.error('Stack:', errorStack);
    return NextResponse.json(
      {
        error: 'Failed to create task',
        message: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}
