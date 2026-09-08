import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Task from '@/lib/models/Task';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const lane = formData.get('lane') as string;
    const priority = formData.get('priority') as string;
    const assigneesStr = formData.get('assignees') as string;
    const assignees = assigneesStr ? JSON.parse(assigneesStr) : [];
    const startDateStr = formData.get('startDate') as string;
    const endDateStr = formData.get('endDate') as string;
    const notification = (formData.get('notification') as string) || 'none';
    const reminderDate = formData.get('reminderDate') as string;
    const reminderTime = formData.get('reminderTime') as string;
    const repeatFrequency = formData.get('repeatFrequency') as string;
    const selectedDaysStr = formData.get('selectedDays') as string;
    const selectedDays = selectedDaysStr ? JSON.parse(selectedDaysStr) : [4];
    const selectedMonthDay = parseInt(formData.get('selectedMonthDay') as string) || 15;
    const repeatTime = formData.get('repeatTime') as string;
    const resetCard = (formData.get('resetCard') as string) === 'true';

    // Parse dates - convert Thai date string to Date
    const parseThaiDate = (dateStr: string): Date | null => {
      if (!dateStr) return null;
      // Format: "7 ต.ค. 2569" → convert to Date
      try {
        // Split by space
        const parts = dateStr.trim().split(/\s+/);
        if (parts.length < 3) return null;

        const day = parseInt(parts[0]);
        const monthStr = parts[1]; // "ต.ค." format
        const year = parseInt(parts[2]);

        // Thai month map
        const monthMap: { [key: string]: number } = {
          'ม.ค.': 0, 'มค': 0, 'มกราคม': 0,
          'ก.พ.': 1, 'กพ': 1, 'กุมภาพันธ์': 1,
          'มี.ค.': 2, 'มค': 2, 'มีนาคม': 2,
          'เม.ย.': 3, 'เมย': 3, 'เมษายน': 3,
          'พ.ค.': 4, 'พค': 4, 'พฤษภาคม': 4,
          'มิ.ย.': 5, 'มิย': 5, 'มิถุนายน': 5,
          'ก.ค.': 6, 'กค': 6, 'กรกฎาคม': 6,
          'ส.ค.': 7, 'สค': 7, 'สิงหาคม': 7,
          'ก.ย.': 8, 'กย': 8, 'กันยายน': 8,
          'ต.ค.': 9, 'ตค': 9, 'ตุลาคม': 9,
          'พ.ย.': 10, 'พย': 10, 'พฤศจิกายน': 10,
          'ธ.ค.': 11, 'ธค': 11, 'ธันวาคม': 11,
        };

        const month = monthMap[monthStr];
        if (month === undefined) return null;

        // Thai year to AD (Thai year = AD year + 543)
        const adYear = year - 543;
        return new Date(adYear, month, day);
      } catch (e) {
        return null;
      }
    };

    const startDate = parseThaiDate(startDateStr);
    const endDate = parseThaiDate(endDateStr);

    if (!title) {
      return NextResponse.json(
        { error: 'Task title is required' },
        { status: 400 }
      );
    }

    // Get existing task to preserve attachments
    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Handle deleted attachments
    const deletedAttachmentIdsStr = formData.get('deletedAttachmentIds') as string;
    const deletedAttachmentIds = deletedAttachmentIdsStr ? JSON.parse(deletedAttachmentIdsStr) : [];
    
    // Handle new attachments
    let attachments = (existingTask.attachments || []).filter(
      (att: string) => !deletedAttachmentIds.includes(att)
    );
    const attachmentFiles = formData.getAll('attachments') as File[];
    if (attachmentFiles.length > 0) {
      const newAttachments = await Promise.all(
        attachmentFiles.map(async (file) => {
          const buffer = await file.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          return `data:${file.type};base64,${base64}`;
        })
      );
      attachments = [...attachments, ...newAttachments];
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        title,
        description: description || '',
        lane: lane || 'routine',
        priority: priority || 'medium',
        assignees: assignees || [],
        startDate,
        endDate,
        attachments,
        notification,
        reminderDate: notification === 'once' ? reminderDate : null,
        reminderTime: notification === 'once' ? reminderTime : '09:00',
        repeatFrequency: notification === 'repeat' ? repeatFrequency : 'daily',
        selectedDays: notification === 'repeat' ? selectedDays : [4],
        selectedMonthDay: notification === 'repeat' ? selectedMonthDay : 15,
        repeatTime: notification === 'repeat' ? repeatTime : '09:00',
        resetCard: notification === 'repeat' ? resetCard : true,
      },
      { new: true }
    );

    if (!updatedTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        id: updatedTask._id,
        title: updatedTask.title,
        description: updatedTask.description,
        lane: updatedTask.lane,
        priority: updatedTask.priority,
        assignees: updatedTask.assignees,
        createdBy: updatedTask.createdBy,
        startDate: updatedTask.startDate,
        endDate: updatedTask.endDate,
        attachments: updatedTask.attachments,
        notification: updatedTask.notification,
        reminderDate: updatedTask.reminderDate,
        reminderTime: updatedTask.reminderTime,
        repeatFrequency: updatedTask.repeatFrequency,
        selectedDays: updatedTask.selectedDays,
        selectedMonthDay: updatedTask.selectedMonthDay,
        repeatTime: updatedTask.repeatTime,
        resetCard: updatedTask.resetCard,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error updating task:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to update task', message: errorMessage },
      { status: 500 }
    );
  }
}
