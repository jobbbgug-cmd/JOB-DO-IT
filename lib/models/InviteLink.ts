import mongoose, { Schema, Document } from 'mongoose';

interface IInviteLink extends Document {
  companyCode: string;
  code: string;
  createdBy: mongoose.Types.ObjectId;
  usedCount: number;
  maxUses: number | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const inviteLinkSchema = new Schema<IInviteLink>(
  {
    companyCode: {
      type: String,
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    maxUses: {
      type: Number,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.InviteLink || mongoose.model<IInviteLink>('InviteLink', inviteLinkSchema);
