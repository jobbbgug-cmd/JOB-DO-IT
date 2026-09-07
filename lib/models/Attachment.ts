import mongoose, { Schema, Document } from 'mongoose';

interface IAttachment extends Document {
  dataUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  companyCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const attachmentSchema = new Schema<IAttachment>(
  {
    dataUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      default: 'application/octet-stream',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    companyCode: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Attachment || mongoose.model<IAttachment>('Attachment', attachmentSchema);
