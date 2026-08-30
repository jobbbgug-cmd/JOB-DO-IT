import mongoose, { Schema, Document } from 'mongoose';

interface ISprint extends Document {
  name: string;
  project: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'active' | 'completed';
  goal: string;
  tasks: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const sprintSchema = new Schema<ISprint>(
  {
    name: {
      type: String,
      required: [true, 'Sprint name is required'],
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['planning', 'active', 'completed'],
      default: 'planning',
    },
    goal: String,
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Sprint || mongoose.model<ISprint>('Sprint', sprintSchema);
