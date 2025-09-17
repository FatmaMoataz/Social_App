import type{ Request, Response } from "express";
import { successResponse } from "../utils/response/success.response";
import { PostModel } from "../../DB/models/Post.model";
import { PostRepository, UserRepository } from "../../DB/repository";
import { UserModel } from "../../DB/models/User.model";

class PostService {
    private userModel = new UserRepository(UserModel)
    private postModel = new PostRepository(PostModel)
    constructor() {}
    createPost = async(req: Request, res:Response):Promise<Response> => {
return successResponse({res, statusCode:201})
    }
}

export default new PostService