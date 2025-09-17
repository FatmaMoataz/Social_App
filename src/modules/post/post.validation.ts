import {z} from 'zod'
import { AllowCommentsEnum, AvailabilityEnum } from '../../DB/models/Post.model'
import { generalFields } from '../../middleware/validation.middleware'
import { fileValidation } from '../utils/multer/cloud.multer'

export const createPost = {
    body:z.strictObject({
            content:z.string().min(2).max(50000).optional(),
            attachments:z.array(generalFields.file(fileValidation.img)).max(2).optional(),
            allowComments:z.enum(AllowCommentsEnum).default(AllowCommentsEnum.allow),
            availability: z.enum(AvailabilityEnum).default(AvailabilityEnum.public),
            tags: z.array(generalFields.id).max(10).optional()
    }).superRefine((data, ctx) => {
if(!data.attachments?.length && !data.content) {
ctx.addIssue({
    code:"custom",
    path:['content'],
    message:"Sorry we cannot make post without at least 2 characters"
})
}
if(data.tags?.length && data.tags.length !== [...new Set(data.tags)].length) {
ctx.addIssue({
    code:"custom",
    path:['tags'],
    message:"Duplicated tagged users"
})
}
    })
}