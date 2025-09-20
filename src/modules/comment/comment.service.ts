import { Request, Response } from "express";
import { successResponse } from "../utils/response/success.response";
import { CommentRepository, PostRepository, UserRepository } from "../../DB/repository";
import { CommentModel, PostModel, UserModel } from "../../DB/models";

class CommentService {
    private userModel = new UserRepository(UserModel)
    private postModel = new PostRepository(PostModel)
    private commentModel = new CommentRepository(CommentModel)
    constructor(){}
    createComment = async(req: Request, res:Response):Promise<Response> => {
return successResponse({res, statusCode:201})
    }
}

export default new CommentService()