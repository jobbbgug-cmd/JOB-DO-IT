import mongoose, { Schema, Document } from 'mongoose';

interface ITeam extends Document {
  companyCode: string;
  name: string;
  description?: string | null;
  members: string[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeam>(
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
    members: {
      type: [String],
      default: [],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Team || mongoose.model<ITeam>('Team', teamSchema);
