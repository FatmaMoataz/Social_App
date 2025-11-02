import type { Request, Response } from "express"
import { IConfirmEmailBodyInputsDto, IForgotCodeBodyInputsDto, IGmail, ILoginBodyInputsDto, IResetCodeBodyInputsDto, ISignupBodyInputsDto, IVerifyCodeBodyInputsDto } from "./auth.dto"
import { ProviderEnum, UserModel } from "../../DB/models/User.model";
import { UserRepository } from "../../DB/repository/user.repository";
import { BadRequest, Conflict, Notfound } from "../utils/response/error.response";
import { compareHash, generateHash } from "../utils/security/hash.security";
import { emailEvent } from "../utils/email/email.event";
import { generateNumberOtp } from "../utils/otp";
import { loginCredentials } from "../utils/security/token.security";
import {OAuth2Client, type TokenPayload} from 'google-auth-library';
import { successResponse } from "../utils/response/success.response";
import { ILoginResponse } from "./auth.entities";

class AuthenticationService {
  private userModel = new UserRepository(UserModel)
    constructor(){
    }

    private async verifyGmailAccount (idToken: string):Promise<TokenPayload>{

  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.WEB_CLIENT_IDS?.split(",") || [],
  });
  const payload = ticket.getPayload();
  if(!payload?.email_verified) {
    throw new BadRequest("Fail to verify this google account")
  }
  return payload
    }
    /**
     * 
     * @param req - Express.Request
     * @param res - Express.Response
     * @returns Promise<Response>
     * @example({username, email, password}: ISignupBodyInputsDto)
     * return {message:'Done', statusCode:201}
     */

loginWithGmail = async(req: Request, res: Response): Promise<Response> => {
  const {idToken}: IGmail = req.body
  const {email} = await this.verifyGmailAccount(idToken)
  const user = await this.userModel.findOne({
    filter: {
      email,
      provider: ProviderEnum.GOOGLE
    }
  })
  if(!user) {
    throw new Notfound("Not registered account or Registered with another provider")
  }

const credentials = await loginCredentials(user)

return successResponse<ILoginResponse>({res, data:{credentials}})
}

signupWithGmail = async(req: Request, res: Response): Promise<Response> => {
  const {idToken}: IGmail = req.body
  const {email, family_name, given_name, picture} = await this.verifyGmailAccount(idToken)
  const user = await this.userModel.findOne({
    filter: {
      email
    }
  })
  if(user) {
    if(user.provider === ProviderEnum.GOOGLE) {
       return await this.loginWithGmail(req, res)
    }
    throw new Conflict(`Email exist with another provider ${user.provider}`)
  }
  const [newUser] = (await this.userModel.create({
    data:[{
      email: email as string,
      firstname: given_name as string,
      lastname: family_name as string,
      profileImg: picture as string,
      confirmedAt: new Date(),
      provider:ProviderEnum.GOOGLE
    }]
  })) || []
  if(!newUser) {
    throw new BadRequest("Failed to signup with gmail please try again later")
  }

const credentials = await loginCredentials(newUser)

return successResponse<ILoginResponse>({res, statusCode:201 ,data:{credentials}})
}

signup=async(req: Request, res: Response):Promise<Response> =>{
     let { username, email, password}: ISignupBodyInputsDto = req.body
     const checkUserExist = await this.userModel.findOne({
      filter:{email},
      select:"email",
      options:{
        lean:true
      }
     })
     if(checkUserExist) {
      throw new Conflict("Email already exists")
     }
     const otp = generateNumberOtp()
   await this.userModel.createUser({
      data:[{username, email, password: await generateHash(password), confirmEmailOtp: await generateHash(String(otp)), gender: req.body.gender}]
    })
    emailEvent.emit("confirmEmail", {to: email, otp})
     return successResponse({res, statusCode:201})
}

confirmEmail=async(req: Request, res: Response):Promise<Response> =>{
const {email, otp}: IConfirmEmailBodyInputsDto = req.body
const user = await this.userModel.findOne({
  filter:{email, confirmEmailOtp:{$exists: true}, confirmedAt:{$exists:false}}
})
if(!user) {
  throw new Notfound("Invalid account")
}
if(!await compareHash(otp, user.confirmEmailOtp as string)) {
  throw new Conflict("Invalid confirmation code")
}
await this.userModel.updateOne({
  filter:{email},
  update:{
    confirmedAt: new Date(),
    $unset:{confirmEmailOtp: 1}
  }
})
return successResponse({res})
}

login = async(req: Request, res: Response): Promise<Response> => {
const {email, password}: ILoginBodyInputsDto = req.body
const user = await this.userModel.findOne({
  filter:{email, provider: ProviderEnum.SYSTEM}
})
if(!user || !(await compareHash(password, user.password))) {
  throw new Notfound("Invalid login credentials")
}
if(!user.confirmedAt) {
  throw new BadRequest("Verify your account first")
}
const credentials = await loginCredentials(user)
return successResponse<ILoginResponse>({res, data:{credentials}})
}

sendForgotCode = async(req: Request, res: Response): Promise<Response> => {
const {email}: IForgotCodeBodyInputsDto = req.body
const user = await this.userModel.findOne({
  filter:{email, provider: ProviderEnum.SYSTEM, confirmedAt:{$exists: true}}
})
if(!user) {
  throw new Notfound("Invalid account: not registered, invalid provider or not confirmed")
}
const otp = generateNumberOtp()
const result = await this.userModel.updateOne({
  filter:{email},
  update: {
    resetPasswordOtp: await generateHash(String(otp))
  }
})
if(!result.matchedCount) {
throw new BadRequest("Failed to send the reset code please try again later")
}
emailEvent.emit("resetPassword", {to:email, otp})
return res.json({message:"Done", data:{otp}})
}

verifyForgotCode = async(req: Request, res: Response): Promise<Response> => {
const {email, otp}: IVerifyCodeBodyInputsDto = req.body
const user = await this.userModel.findOne({
  filter:{email, provider: ProviderEnum.SYSTEM, resetPasswordOtp:{$exists: true}}
})
if(!user) {
  throw new Notfound("Invalid account: not registered, invalid provider, not confirmed or missing reset password code")
}

if(!(await compareHash(otp, user.resetPasswordOtp as string))){
  throw new Notfound("Invalid otp")
} 

return res.json({message:"Done", data:{otp}})
}

resetForgotCode = async(req: Request, res: Response): Promise<Response> => {
const {email, otp, password}: IResetCodeBodyInputsDto = req.body
const user = await this.userModel.findOne({
  filter:{email, provider: ProviderEnum.SYSTEM, resetPasswordOtp:{$exists: true}}
})
if(!user) {
  throw new Notfound("Invalid account: not registered, invalid provider, not confirmed or missing reset password code")
}

if(!(await compareHash(otp, user.resetPasswordOtp as string))){
  throw new Conflict("Invalid otp")
} 

const result = await this.userModel.updateOne({
  filter: {email},
  update:{
 password: await generateHash(password),
 changeCredentials: new Date(),
 $unset: { resetPasswordOtp: 1}
  }
})
if(!result.matchedCount) {
throw new BadRequest("Failed to reset password")
}

return res.json({message:"Done", data:{otp}})
}

}


export default new AuthenticationService