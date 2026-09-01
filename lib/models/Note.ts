import mongoose, { Schema, Document } from 'mongoose';

interface INote extends Document {
  companyCode: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
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
    content: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Note || mongoose.model<INote>('Note', noteSchema);
