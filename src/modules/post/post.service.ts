import type{ Request, Response } from "express";
import { successResponse } from "../utils/response/success.response";
import { AvailabilityEnum, HPostDocument, LikeActionEnum, PostModel } from "../../DB/models/Post.model";
import { PostRepository, UserRepository } from "../../DB/repository";
import { UserModel } from "../../DB/models/User.model";
import { BadRequest, Notfound } from "../utils/response/error.response";
import { deleteFiles, uploadFiles } from "../utils/multer/s3.config";
import {v4 as uuid} from 'uuid'
import { LikePostQueryInputsDto } from "./post.dto";
import { UpdateQuery } from "mongoose";

export const postAvailability = (req:Request) => {
    return [
        {availability:AvailabilityEnum.public},
        {availability:AvailabilityEnum.onlyMe, createdBy: req.user?._id},
        {availability:AvailabilityEnum.friends, createdBy: {$in:[...(req.user?.friends || []), req.user?._id]}},
        {availability:{$ne:AvailabilityEnum.onlyMe}, tags: {$in:req.user?._id}},
    ]
}

class PostService {
    private userModel = new UserRepository(UserModel)
    private postModel = new PostRepository(PostModel)
    constructor() {}
    createPost = async(req: Request, res:Response):Promise<Response> => {
        if(req.body.tags?.length && (await this.userModel.find({filter:{_id:{$in:req.body.tags}, paranoid:false}})).length !== req.body.tags.length) {
throw new Notfound("Some of the mentioned users doesn't exist")
        }
        let attachments:string[]= []
        let assetsFolderId:string=uuid()
        if(req.files?.length) {
attachments = await uploadFiles({files:req.files as Express.Multer.File[], path:`users/${req.user?._id}/post/${assetsFolderId}`})
        }
        const [post] = await this.postModel.create({
            data:[
                {
                    ...req.body,
                    attachments,
                    assetsFolderId,
                    createdBy:req.user?._id
                }
            ]
        }) || []
        if(!post) {
if(attachments.length) {
await deleteFiles({urls:attachments})
}
throw new BadRequest("Failed to create this post")
        }
return successResponse({res, statusCode:201})
    }

    likePost = async(req: Request, res:Response):Promise<Response> => {
        const {postId} = req.params as {postId: string}
        const {action} = req.query as LikePostQueryInputsDto
        let update: UpdateQuery<HPostDocument> = {$addToSet:{likes: req.user?._id}}
        if(action === LikeActionEnum.unlike) {
 update = {$pull:{likes: req.user?._id}}
        } 
        const post = await this.postModel.findOneAndUpdate({
filter:{_id: postId,
    $or: postAvailability(req)
},
update
        })
        if(!post) {
throw new Notfound("Invalid postId or post doesn't exist")
        }
return successResponse({res})
    }
}

export const postService = new PostService()