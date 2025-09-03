import type { Request, Response } from "express"
import { IConfirmEmailBodyInputsDto, IGmail, ILoginBodyInputsDto, ISignupBodyInputsDto } from "./auth.dto"
import { ProviderEnum, UserModel } from "../../DB/models/User.model";
import { UserRepository } from "../../DB/repository/user.repository";
import { BadRequest, Conflict, Notfound } from "../utils/response/error.response";
import { compareHash, generateHash } from "../utils/security/hash.security";
import { emailEvent } from "../utils/events/email.event";
import { generateNumberOtp } from "../utils/otp";
import { loginCredentials } from "../utils/security/token.security";
import {OAuth2Client, type TokenPayload} from 'google-auth-library';

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
    const user = await this.userModel.createUser({
      data:[{username, email, password: await generateHash(password), confirmEmailOtp: await generateHash(String(otp)), gender: req.body.gender}]
    })
    emailEvent.emit("confirmEmail", {to: email, otp})
     return res.status(201).json({message:"Done", data:{user}})
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
     return res.status(201).json({message:"Done"})
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
return res.json({message:"Done", data:{credentials}})
}

loginWithGmail = async(req: Request, res: Response): Promise<Response> => {
  const {idToken}: IGmail = req.body
  const {email} = await this.verifyGmailAccount(idToken)
  const user = this.userModel.findOne({
    filter: {
      email,
      provider: ProviderEnum.GOOGLE
    }
  })
  if(!user) {
    throw new Notfound(`Not registered account or Registered with another provider`)
  }

const credentials = await loginCredentials(user)

return res.json({message:"Done", data: {credentials}})
}

signupWithGmail = async(req: Request, res: Response): Promise<Response> => {
  const {idToken}: IGmail = req.body
  const {email, family_name, given_name, name, picture} = await this.verifyGmailAccount(idToken)
  const user = this.userModel.findOne({
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

return res.status(201).json({message:"Done", data: {credentials}})
}

}


export default new AuthenticationService