import { HUserDocument } from "../../DB/models/User.model"

export interface IProfileImgResponse {
    url:string
}

export interface IUserResponse  {
 user: Partial<HUserDocument>
}