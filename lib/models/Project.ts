import mongoose, { Schema, Document } from 'mongoose';

interface IProject extends Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  members: Array<{
    user: mongoose.Types.ObjectId;
    role: string;
  }>;
  status: 'active' | 'archived' | 'planning';
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
    },
    description: String,
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        role: String,
      },
    ],
    status: {
      type: String,
      enum: ['active', 'archived', 'planning'],
      default: 'active',
    },
    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model<IProject>('Project', projectSchema);
