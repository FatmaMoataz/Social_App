import { Router } from "express";
import userService from "./user.service";
import { authentication } from "../../middleware/authentication.middleware";
import { validation } from "../../middleware/validation.middleware";
import * as validators from './user.validation'
import { TokenEnum } from "../utils/security/token.security";
import { cloudFileUpload, fileValidation, StorageEnum } from "../utils/multer/cloud.multer";

const router = Router()

router.get("/", authentication(),userService.profile)
router.patch("/profile-img", authentication(), cloudFileUpload({validation: fileValidation.img ,storageApproach:StorageEnum.disk}).single("img"),userService.profileImg)
router.patch("/profile-cover-img", authentication(), cloudFileUpload({validation: fileValidation.img ,storageApproach:StorageEnum.disk}).array("imgs", 2),userService.profileCoverImg)
router.post("/refresh-token", authentication(TokenEnum.refresh), userService.refreshToken)
router.post("/logout", authentication(), validation(validators.logout),userService.logout)
export default router
