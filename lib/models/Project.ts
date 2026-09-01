import mongoose, { Schema, Document } from 'mongoose';

interface IProject extends Document {
  companyCode: string;
  name: string;
  description?: string | null;
  status: 'active' | 'archived' | 'planning';
  taskCount: number;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    companyCode: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'planning'],
      default: 'planning',
    },
    taskCount: {
      type: Number,
      default: 0,
    },
    memberCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model<IProject>('Project', projectSchema);
