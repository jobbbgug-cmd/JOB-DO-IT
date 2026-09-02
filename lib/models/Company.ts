import mongoose, { Schema, Document } from 'mongoose';

interface ICompany extends Document {
  companyCode: string;
  companyName: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    companyCode: { type: String, required: true, unique: true, index: true },
    companyName: { type: String, required: true },
    ownerId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Company || mongoose.model<ICompany>('Company', companySchema);
