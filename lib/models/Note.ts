import mongoose, { Schema, Document } from 'mongoose';

interface INote extends Document {
  companyCode: string;
  title: string;
  content: string;
  links?: string;
  color?: string;
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
    links: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: 'rgb(254, 243, 160)',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Note || mongoose.model<INote>('Note', noteSchema);
