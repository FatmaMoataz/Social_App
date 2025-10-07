import type{ Request, Response } from "express"
import { IFreezeAccountDto, IHardDeleteDto, ILogoutDto, IRestoreAccountDto } from "./user.dto"
import { createRevokeToken, loginCredentials, LogoutEnum } from "../utils/security/token.security"
import { Types, UpdateQuery } from "mongoose"
import { HUserDocument, IUser, RoleEnum, UserModel } from "../../DB/models/User.model"
import { UserRepository } from "../../DB/repository/user.repository"
import { TokenRepository } from "../../DB/repository/token.repository"
import { TokenModel } from "../../DB/models/Token.model"
import { JwtPayload } from "jsonwebtoken"
import { createPreSignUploadLink, deleteFiles, deleteFolderByPrefix, uploadFiles } from "../utils/multer/s3.config"
import { BadRequest, Forbidden, Notfound, Unauthorized } from "../utils/response/error.response"
import { s3Event } from "../utils/multer/s3.multer"
import { successResponse } from "../utils/response/success.response"
import { IUserResponse, IProfileImgResponse } from "./user.entities"
import { ILoginResponse } from "../auth/auth.entities"
import { PostRepository } from "../../DB/repository"
import { PostModel } from "../../DB/models"

class userService {
    private userModel = new UserRepository(UserModel)
    private tokenModel = new TokenRepository(TokenModel)
    private postModel = new PostRepository(PostModel)

    constructor(){}

    profile = async(req: Request, res: Response):Promise<Response> => {
        if(!req.user) {
throw new Unauthorized("missing user details")
        }
return successResponse<IUserResponse>({res, data:{user: req.user}})
    }

    dashboard = async(req: Request, res: Response):Promise<Response> => {
        const results = await Promise.allSettled([
this.userModel.find({filter:{}}),
this.postModel.find({filter:{}})
        ])

return successResponse({res, data:{results}})
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
return successResponse<ILoginResponse>({res, statusCode:201 ,data:{credentials}})
    }

    profileImg = async(req: Request, res: Response):Promise<Response> => {
const {ContentType, originalname}:{ContentType:string, originalname:string} = req.body
const {url, key} = await createPreSignUploadLink({
    ContentType, originalname, path:`users/${req.decoded?._id}`
})
const user = await this.userModel.findByIdAndUpdate({
id: req.user?._id as Types.ObjectId,
update:{
    profileImg:key,
    tempProfileImg:req.user?.profileImg
}
})
if(!user) {
    throw new BadRequest("Failed to update user profile image")
}
s3Event.emit("trackProfileImgUpload", {
    userId: req.user?._id, 
    oldKey: req.user?.profileImg, 
    key,
    expiresIn: 30000
})
return successResponse<IProfileImgResponse>({res, data:{url}})
    }

    profileCoverImg = async(req: Request, res: Response):Promise<Response> => {
const urls = await uploadFiles({
    files:req.files as Express.Multer.File[],
    path: `users/${req.decoded?._id}/cover`,
    isLarge:true
})
const user = this.userModel.findByIdAndUpdate({
    id: req.user?._id as Types.ObjectId,
    update:{
        coverImgs:urls
    }
})
if(!user) {
throw new BadRequest("Failed to update profile cover images")
}
if(req.user?.coverImgs) {
    await deleteFiles({urls: req.user.coverImgs})
}
return successResponse<IUserResponse>({res})
    }

    freezeAccount = async(req: Request, res: Response):Promise<Response> => {
        const {userId} = (req.params as  IFreezeAccountDto) || {}
        if(userId && req.user?.role !== RoleEnum.admin) {
throw new Forbidden("Not authorized user")
        }
        const user = await this.userModel.updateOne({
            filter:{
                _id: userId || req.user?._id,
                freezedAt: { $exists: false},
            },
            update:{
                freezedAt: new Date(),
                freezedBy: req.user?._id,
                changeCredentialsTime: new Date(),
                $unset: {
                    restoredAt:1,
                    restoredBy:1
                }
            }
        })
        if(!user.matchedCount) {
throw new Notfound("User not found or Failed to freeze this resource")
        }
return successResponse({res})
    }

   restoreAccount = async(req: Request, res: Response):Promise<Response> => {
        const {userId} = req.params as  IRestoreAccountDto

        const user = await this.userModel.updateOne({
            filter:{
                _id: userId,
                freezedBy: { $ne: userId},
            },
            update:{
                restoredAt: new Date(),
                restoredBy: req.user?._id,

                $unset: {
                    freezedAt:1,
                    freezedBy:1
                }
            }
        })
        if(!user.matchedCount) {
throw new Notfound("User not found or Failed to restore this resource")
        }
return res.json({message:"Done"})
    }

    hardDeleteAccount = async(req: Request, res: Response):Promise<Response> => {
        const {userId} = req.params as  IHardDeleteDto

        const user = await this.userModel.deleteOne({
            filter:{
                _id: userId,
                freezedAt:{$exists : true}
            }
        })
        if(!user.deletedCount) {
            throw new Notfound("user not found or hard delete this resource")
        }
await deleteFolderByPrefix({path: `users/${userId}`})
return res.json({message:"Done"})
    }
}


export default new userService()