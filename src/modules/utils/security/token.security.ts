import type { Secret, SignOptions } from "jsonwebtoken"
import {sign} from "jsonwebtoken"

export const generateToken = ({payload, secret = process.env.ACCESS_USER_TOKEN_SIGNATURE as string, options={expiresIn:Number(process.env.ACCESS_TOKEN_EXPIRES_IN)}}:{
    payload: object,
    secret?: Secret,
    options?: SignOptions
}): Promise<String> => {
    return sign(payload, secret, options)
}