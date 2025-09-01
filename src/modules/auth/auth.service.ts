import type { Request, Response } from "express"
import { IConfirmEmailBodyInputsDto, ILoginBodyInputsDto, ISignupBodyInputsDto } from "./auth.dto"
import { UserModel } from "../../DB/models/User.model";
import { UserRepository } from "../../DB/repository/user.repository";
import { BadRequest, Conflict, Notfound } from "../utils/response/error.response";
import { compareHash, generateHash } from "../utils/security/hash.security";
import { emailEvent } from "../utils/events/email.event";
import { generateNumberOtp } from "../utils/otp";
import { loginCredentials } from "../utils/security/token.security";

class AuthenticationService {
  private userModel = new UserRepository(UserModel)
    constructor(){

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
      data:[{username, email, password: await generateHash(password), confirmEmailOtp: await generateHash(String(otp))}]
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
  filter:{email}
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

}


export default new AuthenticationService