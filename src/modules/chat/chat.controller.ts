import { Router } from "express";
import { ChatService } from "./chat.service";
import { authentication } from "../../middleware/authentication.middleware";
import { validation } from "../../middleware/validation.middleware";
import * as validators from './chat.validation'

const router = Router({mergeParams:true})
const chatService:ChatService = new ChatService()
router.get('/' , authentication() , validation(validators.getChat) , chatService.getChat)
export default router