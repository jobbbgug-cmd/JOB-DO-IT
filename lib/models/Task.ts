import mongoose, { Schema, Document } from 'mongoose';

// Database interface - use flexible string types for compatibility with frontend
interface ITask extends Document {
  companyCode: string;
  title: string;
  description?: string | null;
  status: string; // Flexible to match frontend Task type
  priority: string; // Flexible to match frontend Task type
  assignee?: string | null;
  assignees?: string[];
  createdBy?: string | null;
  dueDate?: Date | null;
  startDate?: Date | null;
  endDate?: Date | null;
  sprint?: string | null;
  lane?: 'routine' | 'urgent';
  progress?: number;
  attachments?: string[];
  notification?: 'none' | 'once' | 'repeat';
  reminderDate?: string | null;
  reminderTime?: string;
  repeatFrequency?: 'daily' | 'weekly' | 'monthly';
  selectedDays?: number[];
  selectedMonthDay?: number;
  repeatTime?: string;
  resetCard?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Flexible frontend Task type (use /app/types instead)
export type FrontendTask = Omit<ITask, 'toObject' | 'toJSON'> & {
  status: string; // Allow any string for flexibility
  progress?: number;
};

const taskSchema = new Schema<ITask>(
  {
    companyCode: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'testing-failed', 'wait-testing', 'in-review', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['urgent', 'high', 'medium', 'low'],
      default: 'medium',
    },
    assignee: {
      type: String,
      default: null,
      index: true,
    },
    assignees: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: String,
      default: null,
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    sprint: {
      type: String,
      default: null,
      index: true,
    },
    lane: {
      type: String,
      enum: ['routine', 'urgent'],
      default: 'routine',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    attachments: {
      type: [String],
      default: [],
    },
    notification: {
      type: String,
      enum: ['none', 'once', 'repeat'],
      default: 'none',
    },
    reminderDate: {
      type: String,
      default: null,
    },
    reminderTime: {
      type: String,
      default: '09:00',
    },
    repeatFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily',
    },
    selectedDays: {
      type: [Number],
      default: [4],
    },
    selectedMonthDay: {
      type: Number,
      default: 15,
    },
    repeatTime: {
      type: String,
      default: '09:00',
    },
    resetCard: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    strict: false, // Allow additional fields from model
  }
);

// Force collection drop and recreate if needed (for development)
// Uncomment if schema changes aren't reflected:
// if (mongoose.connection.collections['tasks']) {
//   mongoose.connection.dropCollection('tasks');
// }

export default mongoose.models.Task || mongoose.model<ITask>('Task', taskSchema);
