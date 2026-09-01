import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Project from '@/lib/models/Project';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyCode: string }> }
) {
  try {
    await connectDB();
    const { companyCode } = await params;

    const projects = await Project.find({ companyCode }).lean();

    const formattedProjects = projects.map((project: any) => ({
      id: project._id?.toString() || '',
      name: project.name,
      description: project.description || null,
      status: project.status || 'planning',
      taskCount: project.taskCount || 0,
      memberCount: project.memberCount || 0,
    }));

    return NextResponse.json(formattedProjects);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ companyCode: string }> }
) {
  try {
    await connectDB();
    const { companyCode } = await params;
    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Project name required' }, { status: 400 });
    }

    const project = await Project.create({
      companyCode,
      name,
      description: description || null,
      status: 'planning',
      taskCount: 0,
      memberCount: 0,
    });

    return NextResponse.json({
      success: true,
      project: {
        id: project._id.toString(),
        name: project.name,
        description: project.description || null,
        status: project.status,
        taskCount: 0,
        memberCount: 0,
      },
    });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
