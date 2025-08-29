import { Schema, Document, model, models } from "mongoose";

export enum GenderEnum {
  male='male',
  female='female'
}

export enum RoleEnum {
  user='user',
  admin='admin'
}

export interface IUser extends Document {
  // _id: Types.ObjectId
  firstname: string;
  lastname: string;
  username?: string;
  email: string;
  confirmEmailOtp?: String;
  confirmedAt?: Date
  password: string;
  resetPasswordOtp?:string;
  changeCredentialsTime?:Date;
  phone?:string;
  address?:string;
  gender: string;
  role:string;
  updatedAt?:Date;
  createdAt:Date;
}

const userSchema = new Schema<IUser>({

firstname:{type:String, required: true, minLength:2, maxLength:25},
lastname:{type:String, required: true, minLength:2, maxLength:25},

email:{type:String, required:true, unique:true},
confirmEmailOtp:{type:String},
confirmedAt:{type:Date},

password:{type:String, required:true},
resetPasswordOtp:{type:String},
changeCredentialsTime:{type:Date},

phone:{type:String},
address:{type:String},

gender:{type:String, enum:GenderEnum, default:GenderEnum.male},
role:{type:String, enum:RoleEnum, default:RoleEnum.user},

updatedAt:{type:Date},
createdAt:{type:Date}
 
}, { timestamps: true,
  toJSON: {virtuals:true},
  toObject:{virtuals:true}
 });

userSchema.virtual("username").set(function (value:string) {
  const [firstname, lastname] = value.split(' ') || []
  this.set({firstname, lastname})
}).get(function () {
  return this.firstname + " " + this.lastname
})

export const UserModel = models.User || model<IUser>("User", userSchema)