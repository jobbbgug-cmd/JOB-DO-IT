import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Task from '@/lib/models/Task';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId') as string;

    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Find the task
    const task = await Task.findById(id);
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // If employeeId provided, remove them from assignees
    if (employeeId) {
      const assignees = task.assignees || [];
      const updatedAssignees = assignees.filter((id: string) => String(id) !== String(employeeId));

      // If no assignees left, delete the task
      if (updatedAssignees.length === 0) {
        await Task.findByIdAndDelete(id);
        return NextResponse.json(
          { message: 'Task deleted successfully (no assignees left)', id },
          { status: 200 }
        );
      }

      // Otherwise, update the task with remaining assignees
      const updatedTask = await Task.findByIdAndUpdate(
        id,
        { assignees: updatedAssignees },
        { new: true }
      );

      return NextResponse.json(
        { message: 'Assignee removed successfully', id, updatedTask },
        { status: 200 }
      );
    }

    // If no employeeId, delete entire task (backward compatibility)
    const result = await Task.findByIdAndDelete(id);
    return NextResponse.json(
      { message: 'Task deleted successfully', id },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error deleting task:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to delete task', message: errorMessage },
      { status: 500 }
    );
  }
}
