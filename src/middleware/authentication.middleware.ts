import type{ NextFunction, Request, Response } from "express"
import { decodeToken } from "../modules/utils/security/token.security"
import { BadRequest } from "../modules/utils/response/error.response"
import { HUserDocument } from "../DB/models/User.model"
import { JwtPayload } from "jsonwebtoken"

interface IAuthReq extends Request {
user: HUserDocument,
decoded: JwtPayload
}

export const authentication = () => {
    return async(req: IAuthReq, res: Response, next: NextFunction) => {
        if(!req.headers.authorization) {
throw new BadRequest("Validation Error", {
    key:"headers",
    issues:[{path:"authorization", message:"Missing authorization"}]})
        }
const {decoded, user} = await decodeToken({authorization:req.headers.authorization})
req.user = user
req.decoded = decoded
        next()
    }
}