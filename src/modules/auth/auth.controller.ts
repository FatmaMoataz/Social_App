import { Router } from "express";
import authService from './auth.service'
import * as validators from './auth.validation'
import { validation } from "../../middleware/validation.middleware";

const router = Router()

router.post("/signup",validation(validators.signup),authService.signup)
// router.patch('/send-email',validation(validators.sendEmail), authService.sendEmail)
router.patch('/confirm-email',validation(validators.confirmEmail), authService.confirmEmail)
// router.post("/login", validation(validators.login),authService.login)

export default router