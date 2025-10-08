import { Router } from "express";
import userService from "./user.service";
import { authentication, authorization } from "../../middleware/authentication.middleware";
import { validation } from "../../middleware/validation.middleware";
import * as validators from './user.validation'
import { TokenEnum } from "../utils/security/token.security";
import { cloudFileUpload, fileValidation, StorageEnum } from "../utils/multer/cloud.multer";
import { endpoint } from "./user.authorization";

const router = Router()

router.get("/", authentication(),userService.profile)
router.get("/dashboard", authorization(endpoint.dashboard),userService.dashboard)
router.patch("/:userId/change-role", authorization(endpoint.dashboard), validation(validators.changeRole),userService.changeRole)

router.delete("{/:userId}/freeze-account", authentication(),validation(validators.freezeAccount) ,userService.freezeAccount)

router.delete("/:userId", authentication(endpoint.hardDelete),validation(validators.freezeAccount) ,userService.hardDeleteAccount)

router.patch("/:userId/restore-account", authorization(endpoint.restoreAccount),validation(validators.restoreAccount) ,userService.freezeAccount)

router.patch("/profile-img", authentication(), userService.profileImg)
router.patch("/profile-cover-img", authentication(), cloudFileUpload({validation: fileValidation.img ,storageApproach:StorageEnum.disk}).array("imgs", 2),userService.profileCoverImg)
router.post("/refresh-token", authentication(TokenEnum.refresh), userService.refreshToken)
router.post("/logout", authentication(), validation(validators.logout),userService.logout)
export default router
