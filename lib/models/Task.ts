import mongoose, { Schema, Document } from 'mongoose';

interface ITask extends Document {
  title: string;
  description: string;
  project: mongoose.Types.ObjectId;
  assignee: mongoose.Types.ObjectId;
  status: 'todo' | 'in-progress' | 'in-review' | 'done';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  type: 'feature' | 'bug' | 'improvement' | 'task';
  dueDate: Date;
  estimatedHours: number;
  actualHours: number;
  progress: number;
  tags: string[];
  comments: Array<{
    user: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }>;
  sprint: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
    },
    description: String,
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
    type: {
      type: String,
      enum: ['feature', 'bug', 'improvement', 'task'],
      default: 'task',
    },
    dueDate: Date,
    estimatedHours: Number,
    actualHours: Number,
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    tags: [String],
    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    sprint: {
      type: Schema.Types.ObjectId,
      ref: 'Sprint',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Task || mongoose.model<ITask>('Task', taskSchema);
