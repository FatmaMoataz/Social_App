import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  confirmEmail?: Boolean;
  emailOtp?: string | undefined;
  otpExpires?: Date | undefined
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, minlength: 5, maxlength: 20 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  confirmEmail: { type: Boolean, default: false },
emailOtp: { type: String },
otpExpires: { type: Date }
 
}, { timestamps: true });

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
