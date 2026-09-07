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
      tasks.map((task: any) => {
        const obj: any = {
          id: task._id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assignee: task.assignee,
          assignees: task.assignees || [],
          createdBy: task.createdBy,
          lane: task.lane,
          progress: task.progress,
          sprint: task.sprint,
          dueDate: task.dueDate,
          startDate: task.startDate,
          endDate: task.endDate,
          attachments: task.attachments || [],
          notification: task.notification || 'none',
          reminderDate: task.reminderDate,
          reminderTime: task.reminderTime,
          repeatFrequency: task.repeatFrequency,
          selectedDays: task.selectedDays,
          selectedMonthDay: task.selectedMonthDay,
          repeatTime: task.repeatTime,
          resetCard: task.resetCard,
        };
        return obj;
      })
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

    const formData = await req.formData();

    // Debug: log all formData keys
    const keys = Array.from(formData.keys());
    console.log('FormData keys:', keys);

    const companyCode = formData.get('companyCode') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const lane = formData.get('lane') as string;
    const priority = formData.get('priority') as string;
    const sprint = formData.get('sprint') as string;
    const progress = parseInt(formData.get('progress') as string) || 0;
    const createdBy = formData.get('createdBy') as string;
    const assigneesStr = formData.get('assignees') as string;
    const assignees = assigneesStr ? JSON.parse(assigneesStr) : [];

    console.log('DEBUG API - companyCode:', companyCode, 'createdBy:', createdBy, 'has createdBy key:', keys.includes('createdBy'));

    // Check attachments (already base64 from upload endpoint)
    const attachmentValues = formData.getAll('attachments');
    const attachmentStrings = attachmentValues.filter(v => typeof v === 'string') as string[];
    console.log('DEBUG API - attachments count:', attachmentStrings.length, 'has attachments key:', keys.includes('attachments'));
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

    // Attachments are already base64 strings from upload endpoint
    const attachments = attachmentStrings;

    console.log('Creating task with:', {
      companyCode, title, assignees, createdBy,
      startDate, endDate, notification,
      attachments: attachments.length
    });

    const taskData = {
      companyCode,
      title,
      description,
      status: 'todo',
      priority: priority || 'medium',
      assignees: Array.isArray(assignees) ? assignees : [assignees],
      createdBy,
      sprint,
      lane: lane || 'routine',
      progress,
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
    };

    console.log('DEBUG - Task data to save - has createdBy:', !!taskData.createdBy, 'has startDate:', !!taskData.startDate, 'has notification:', !!taskData.notification);

    const task = await Task.create(taskData);
    const taskObj = task.toObject();

    console.log('Task saved - Object:', JSON.stringify(taskObj, (key, value) => {
      if (value instanceof Date) return value.toISOString();
      return value;
    }));

    return NextResponse.json(
      {
        id: String(taskObj._id),
        ...taskObj,
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
