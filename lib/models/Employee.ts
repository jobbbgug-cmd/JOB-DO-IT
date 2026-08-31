import mongoose, { Schema, Document } from 'mongoose';

interface IEmployee extends Document {
  companyCode: string;
  name: string;
  role: string;
  presence: boolean;
  taskCount: number;
  tasks: Array<{
    id: string;
    title: string;
    progress: number;
    lane: 'routine' | 'urgent';
    time: string;
    assignee: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<IEmployee>(
  {
    companyCode: { type: String, required: true, index: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    presence: { type: Boolean, default: true },
    taskCount: { type: Number, default: 0 },
    tasks: [
      {
        id: String,
        title: String,
        progress: Number,
        lane: { type: String, enum: ['routine', 'urgent'] },
        time: String,
        assignee: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Employee || mongoose.model<IEmployee>('Employee', employeeSchema);
