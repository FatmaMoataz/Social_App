import type { Request, Response } from "express"
import { BadRequest } from "../utils/response/error.response"
import { IConfirmEmailBodyInputsDto, ILoginBodyInputsDto, ISignupBodyInputsDto } from "./auth.dto"
import { UserModel } from "../../DB/models/User.model"
import * as validators from './auth.validation'
import crypto from "crypto";
import { sendEmail } from "../utils/email/email.service"

class AuthenticationService {
    constructor(){}
    signup=async(req: Request, res: Response):Promise<Response> =>{
       try {
        await validators.signup.body.parseAsync(req.body)
         const {username, email, password}: ISignupBodyInputsDto = req.body
        const userExist = await UserModel.findOne({email})
        if(userExist) {
            throw new BadRequest("Email already exists", 400)
        }
        const newUser = new UserModel({username, email, password})
        const otp = crypto.randomInt(100000, 999999).toString();
newUser.emailOtp = otp;
newUser.otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
        await newUser.save()
        await sendEmail(
  newUser.email,
  "Confirm your email",
  `<p>Your confirmation code is: <b>${otp}</b></p>`
);
        return res.status(201).json({ message: "User created successfully", data: newUser })

       } catch (error:any) {
        if(error.errors || error.issues) {
            return res.status(400).json({
                message:"Validation Error",
                issues: error.issues || error.errors
            })
        }
        return res.status(error.statusCode || 500).json({message:error.message || "Something went wrong"})
       }
}
    login=async(req: Request, res: Response):Promise<Response>=>{
    try {
        let {email} : ILoginBodyInputsDto = req.body
        const userExist = await UserModel.findOne({email})
        if(!userExist) {
            throw new BadRequest("Incorrect login credentials",404)
        }
        return res.status(200).json({message:"Successful Login" })
        
    } catch (e:any) {
        return res.status(e.statusCode || 500).json({ message: e.message || "Something went wrong" })
    }
}
confirmEmail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, otp }: IConfirmEmailBodyInputsDto = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      throw new BadRequest("Invalid account", 404);
    }

    if (user.confirmEmail) {
      return res.status(200).json({ message: "Email already confirmed" });
    }

    if (!user.emailOtp || user.emailOtp !== otp) {
      throw new BadRequest("Invalid or expired code", 400);
    }

    if (user.otpExpires && user.otpExpires < new Date()) {
      throw new BadRequest("Code expired, please request a new one", 400);
    }

    user.confirmEmail = true;
    user.emailOtp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "Email confirmed successfully" });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
};

sendEmail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email }: { email: string } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      throw new BadRequest("Invalid account", 404);
    }

    if (user.confirmEmail) {
      return res.status(200).json({ message: "Email already confirmed" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    user.emailOtp = otp;
    user.otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await user.save();
    await sendEmail(
      user.email,
      "Confirm your email",
      `<p>Your new confirmation code is: <b>${otp}</b></p>`
    );

    return res
      .status(200)
      .json({ message: "A new confirmation code has been sent to your email" });
  } catch (error: any) {
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Something went wrong" });
  }
};


}


export default new AuthenticationService