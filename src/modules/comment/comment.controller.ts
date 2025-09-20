import { Router } from "express";
import { authentication } from "../../middleware/authentication.middleware";
import { cloudFileUpload, fileValidation } from "../utils/multer/cloud.multer";
import commentService from './comment.service'

const router = Router({mergeParams:true})

router.post("/", authentication(), 
cloudFileUpload({validation:fileValidation.img}).array("attachments",2),
commentService.createComment
)

export default router