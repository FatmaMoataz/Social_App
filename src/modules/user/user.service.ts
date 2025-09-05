import type{ Request, Response } from "express"
import { ILogoutDto } from "./user.dto"
import { createRevokeToken, loginCredentials, LogoutEnum } from "../utils/security/token.security"
import { UpdateQuery } from "mongoose"
import { HUserDocument, IUser, UserModel } from "../../DB/models/User.model"
import { UserRepository } from "../../DB/repository/user.repository"
import { TokenRepository } from "../../DB/repository/token.repository"
import { TokenModel } from "../../DB/models/Token.model"
import { JwtPayload } from "jsonwebtoken"
import { uploadFile, uploadFiles, uploadLargeFile } from "../utils/multer/s3.config"

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

    profileImg = async(req: Request, res: Response):Promise<Response> => {
const key = await uploadLargeFile({
    file:req.file as Express.Multer.File,
    path: `users/${req.decoded?._id}`
})
return res.json({message:"Done",data:{
key
}})
    }

    profileCoverImg = async(req: Request, res: Response):Promise<Response> => {
const urls = await uploadFiles({
    files:req.files as Express.Multer.File[],
    path: `users/${req.decoded?._id}/cover`,
    isLarge:true
})
return res.json({message:"Done",data:{
    urls
}})
    }
}


export default new userService()