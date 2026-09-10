import mongoose, { Schema, Document } from 'mongoose';

interface IPendingRegistration extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  verificationCode: string;
  verificationCodeExpiry: Date;
  createdAt: Date;
}

const pendingRegistrationSchema = new Schema<IPendingRegistration>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    verificationCode: { type: String, required: true },
    verificationCodeExpiry: { type: Date, required: true },
  },
  { timestamps: true }
);

pendingRegistrationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

export default mongoose.models.PendingRegistration || 
  mongoose.model<IPendingRegistration>('PendingRegistration', pendingRegistrationSchema);
