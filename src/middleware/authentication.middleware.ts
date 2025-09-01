import type{ NextFunction, Request, Response } from "express"
import { decodeToken, TokenEnum } from "../modules/utils/security/token.security"
import { BadRequest, Forbidden } from "../modules/utils/response/error.response"
import { RoleEnum } from "../DB/models/User.model"

export const authentication = (tokenType:TokenEnum=TokenEnum.access) => {
    return async(req: Request, res: Response, next: NextFunction) => {
        if(!req.headers.authorization) {
throw new BadRequest("Validation Error", {
    key:"headers",
    issues:[{path:"authorization", message:"Missing authorization"}]})
        }
const {decoded, user} = await decodeToken({authorization:req.headers.authorization, tokenType})
req.user = user
req.decoded = decoded
        next()
    }
}

export const authorization = (accessRoles: RoleEnum[] = [],tokenType:TokenEnum=TokenEnum.access) => {
    return async(req: Request, res: Response, next: NextFunction) => {
        if(!req.headers.authorization) {
throw new BadRequest("Validation Error", {
    key:"headers",
    issues:[{path:"authorization", message:"Missing authorization"}]})
        }
const {decoded, user} = await decodeToken({authorization:req.headers.authorization, tokenType})
if(!accessRoles.includes(user.role)) {
throw new Forbidden("Not authorized account")
}
req.user = user
req.decoded = decoded
        next()
    }
}