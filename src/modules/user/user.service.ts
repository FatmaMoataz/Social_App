import type{ Request, Response } from "express"
import { ILogoutDto } from "./user.dto"
import { createRevokeToken, loginCredentials, LogoutEnum } from "../utils/security/token.security"
import { UpdateQuery } from "mongoose"
import { HUserDocument, IUser, UserModel } from "../../DB/models/User.model"
import { UserRepository } from "../../DB/repository/user.repository"
import { TokenRepository } from "../../DB/repository/token.repository"
import { TokenModel } from "../../DB/models/Token.model"
import { JwtPayload } from "jsonwebtoken"

class userService {
    private userModel = new UserRepository(UserModel)
    private tokenModel = new TokenRepository(TokenModel)
    constructor(){}

    profile = async(req: Request, res: Response):Promise<Response> => {
return res.json({message:"Done",data:{
    user:req.user?._id,
    decoded: req.decoded?.iat
}})
    }

    logout = async(req: Request, res: Response):Promise<Response> => {
        const {flag}:ILogoutDto = req.body
        let statusCode:number = 200
const update:UpdateQuery<IUser> = {}
switch (flag) {
    case LogoutEnum.all:
        update.changeCredentialsTime = new Date()
        break;
    default:
        await this.tokenModel.create({
            data:[{
                jti: req.decoded?.jti as string,
                expiresIn: (req.decoded?.iat as number) + Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
                userId: req.decoded?._id
            }]
        })
        await createRevokeToken(req.decoded as JwtPayload)
        statusCode=201
        break;
}
await this.userModel.updateOne({
    filter:{_id:req.decoded?._id},
    update
})
return res.status(statusCode).json({message:"Done"})
    }

    refreshToken = async(req: Request, res: Response):Promise<Response> => {
const credentials = await loginCredentials(req.user as HUserDocument)
  await createRevokeToken(req.decoded as JwtPayload)
return res.status(201).json({message:'Done ✔', data:{credentials}})
    }
}


export default new userService()