import { Schema, Document, model, models, HydratedDocument, Types } from "mongoose";
import { generateHash } from "../../modules/utils/security/hash.security";
import { emailEvent } from "../../modules/utils/email/email.event";

export enum GenderEnum {
  male='male',
  female='female'
}

export enum RoleEnum {
  user='user',
  admin='admin'
}

export enum ProviderEnum {
  GOOGLE='GOOGLE',
  SYSTEM='SYSTEM'
}

export type HUserDocument = HydratedDocument<IUser>

export interface IUser extends Document {

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
  profileImg?:string;
  tempProfileImg?:string;
  coverImgs?:string[];
  gender: string;
  role:RoleEnum;
  updatedAt?:Date;
  createdAt:Date;
  freezedAt?:Date;
  freezedBy?:Types.ObjectId;
  restoredAt?:Date;
  restoredBy?:Types.ObjectId;
  friends:Types.ObjectId[];
  provider: ProviderEnum;
  slug:string;

}

const userSchema = new Schema<IUser>({

firstname:{type:String, required: true, minLength:2, maxLength:25},
lastname:{type:String, required: true, minLength:2, maxLength:25},
slug:{type:String, required: true, minLength:2, maxLength:50},

email:{type:String, required:true, unique:true},
confirmEmailOtp:{type:String},
confirmedAt:{type:Date},
profileImg:{type:String},
tempProfileImg:{type:String},
coverImgs:{type:String},

password:{type:String, required: function () {
  return this.provider === ProviderEnum.GOOGLE ? false : true
}},
resetPasswordOtp:{type:String},
changeCredentialsTime:{type:Date},

phone:{type:String},
address:{type:String},

gender:{type:String, enum:GenderEnum, default:GenderEnum.male},
role:{type:String, enum:RoleEnum, default:RoleEnum.user},
provider:{type:String, enum:ProviderEnum, default:ProviderEnum.SYSTEM},

updatedAt:{type:Date},
createdAt:{type:Date},

  freezedAt:{type:Date},
  freezedBy:{type:Schema.Types.ObjectId, ref:"User"},
  restoredAt:{type:Date},
  restoredBy:{type:Schema.Types.ObjectId, ref:"User"},
  friends:[{type:Schema.Types.ObjectId, ref:"User"}],
 
}, { timestamps: true,
  strictQuery:true,
  toJSON: {virtuals:true},
  toObject:{virtuals:true}
 });

userSchema.virtual("username").set(function (value:string) {
  const [firstname, lastname] = value.split(' ') || []
  this.set({firstname, lastname, slug:value.replaceAll(/\s+/g, "-")})
}).get(function () {
  return this.firstname + " " + this.lastname
})

userSchema.pre("save", async function(this:HUserDocument & {wasNew:boolean, confirmEmailPlainOtp?:string}, next) {
this.wasNew = this.isNew
if(this.isModified("password")) {
this.password = await generateHash(this.password)
}
if(this.isModified("confirmEmailOtp")) {
this.confirmEmailPlainOtp = this.confirmEmailOtp as string
this.confirmEmailOtp = await generateHash(this.confirmEmailOtp as string)
}
next()
})

userSchema.post("save", async function(doc, next) {
const that = this as HUserDocument &{wasNew:boolean, confirmEmailPlainOtp?:string}
if(that.wasNew && that.confirmEmailPlainOtp) {
emailEvent.emit("confirmEmail", {to:this.email, otp:that.confirmEmailPlainOtp})
}

next()
})

userSchema.pre(["find", "findOne"], function(next) {
  const query = this.getQuery()
if(query.paranoid === false) {
this.setQuery({...query})
}
else {
  this.setQuery({...query, freezedAt:{$exists:false}})
}
  next()
})
export const UserModel = models.User || model<IUser>("User", userSchema)
