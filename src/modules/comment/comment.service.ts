import { Request, Response } from "express";
import { successResponse } from "../utils/response/success.response";

class CommentService {
    constructor(){}
    createComment = async(req: Request, res:Response):Promise<Response> => {
return successResponse({res, statusCode:201})
    }
}

export default new CommentService()