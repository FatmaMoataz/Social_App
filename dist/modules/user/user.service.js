"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const token_security_1 = require("../utils/security/token.security");
const User_model_1 = require("../../DB/models/User.model");
const user_repository_1 = require("../../DB/repository/user.repository");
const token_repository_1 = require("../../DB/repository/token.repository");
const Token_model_1 = require("../../DB/models/Token.model");
const s3_config_1 = require("../utils/multer/s3.config");
const error_response_1 = require("../utils/response/error.response");
const s3_multer_1 = require("../utils/multer/s3.multer");
class userService {
    userModel = new user_repository_1.UserRepository(User_model_1.UserModel);
    tokenModel = new token_repository_1.TokenRepository(Token_model_1.TokenModel);
    constructor() { }
    profile = async (req, res) => {
        return res.json({ message: "Done", data: {
                user: req.user?._id,
                decoded: req.decoded?.iat
            } });
    };
    logout = async (req, res) => {
        const { flag } = req.body;
        let statusCode = 200;
        const update = {};
        switch (flag) {
            case token_security_1.LogoutEnum.all:
                update.changeCredentialsTime = new Date();
                break;
            default:
                await this.tokenModel.create({
                    data: [{
                            jti: req.decoded?.jti,
                            expiresIn: req.decoded?.iat + Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
                            userId: req.decoded?._id
                        }]
                });
                await (0, token_security_1.createRevokeToken)(req.decoded);
                statusCode = 201;
                break;
        }
        await this.userModel.updateOne({
            filter: { _id: req.decoded?._id },
            update
        });
        return res.status(statusCode).json({ message: "Done" });
    };
    refreshToken = async (req, res) => {
        const credentials = await (0, token_security_1.loginCredentials)(req.user);
        await (0, token_security_1.createRevokeToken)(req.decoded);
        return res.status(201).json({ message: 'Done ✔', data: { credentials } });
    };
    profileImg = async (req, res) => {
        const { ContentType, originalname } = req.body;
        const { url, key } = await (0, s3_config_1.createPreSignUploadLink)({
            ContentType, originalname, path: `users/${req.decoded?._id}`
        });
        const user = await this.userModel.findByIdAndUpdate({
            id: req.user?._id,
            update: {
                profileImg: key,
                tempProfileImg: req.user?.profileImg
            }
        });
        if (!user) {
            throw new error_response_1.BadRequest("Failed to update user profile image");
        }
        s3_multer_1.s3Event.emit("trackProfileImgUpload", {
            userId: req.user?._id,
            oldKey: req.user?.profileImg,
            key,
            expiresIn: 30000
        });
        return res.json({ message: "Done", data: {
                url,
                key
            } });
    };
    profileCoverImg = async (req, res) => {
        const urls = await (0, s3_config_1.uploadFiles)({
            files: req.files,
            path: `users/${req.decoded?._id}/cover`,
            isLarge: true
        });
        const user = this.userModel.findByIdAndUpdate({
            id: req.user?._id,
            update: {
                coverImgs: urls
            }
        });
        if (!user) {
            throw new error_response_1.BadRequest("Failed to update profile cover images");
        }
        if (req.user?.coverImgs) {
            await (0, s3_config_1.deleteFiles)({ urls: req.user.coverImgs });
        }
        return res.json({ message: "Done", data: {
                urls
            } });
    };
}
exports.default = new userService();
