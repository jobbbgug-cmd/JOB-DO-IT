import mongoose, { Schema, Document } from 'mongoose';

interface ITask extends Document {
  companyCode: string;
  title: string;
  description?: string | null;
  status: 'todo' | 'in-progress' | 'in-review' | 'done';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignee?: string | null;
  dueDate?: Date | null;
  sprint?: string | null;
  lane?: 'routine' | 'urgent';
  progress?: number;
  createdAt: Date;
  updatedAt: Date;
}

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
      enum: ['todo', 'in-progress', 'in-review', 'done'],
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
    dueDate: {
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
  },
  { timestamps: true }
);

export default mongoose.models.Task || mongoose.model<ITask>('Task', taskSchema);
