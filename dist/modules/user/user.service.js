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
const success_response_1 = require("../utils/response/success.response");
const repository_1 = require("../../DB/repository");
const models_1 = require("../../DB/models");
class userService {
    userModel = new user_repository_1.UserRepository(User_model_1.UserModel);
    tokenModel = new token_repository_1.TokenRepository(Token_model_1.TokenModel);
    postModel = new repository_1.PostRepository(models_1.PostModel);
    friendRequestModel = new repository_1.FriendRequestRepository(models_1.FriendRequestModel);
    constructor() { }
    profile = async (req, res) => {
        const profile = await this.userModel.findById({
            id: req.user?._id,
            options: {
                populate: [
                    {
                        path: "friends",
                        select: "firstName lastName email gender profilePicture"
                    }
                ]
            }
        });
        if (!profile) {
            throw new error_response_1.Notfound("Failed to find user profile");
        }
        if (!req.user) {
            throw new error_response_1.Unauthorized("missing user details");
        }
        return (0, success_response_1.successResponse)({ res, data: { user: profile } });
    };
    dashboard = async (req, res) => {
        const results = await Promise.allSettled([
            this.userModel.find({ filter: {} }),
            this.postModel.find({ filter: {} }),
        ]);
        return (0, success_response_1.successResponse)({ res, data: { results } });
    };
    changeRole = async (req, res) => {
        const { userId } = req.params;
        const { role } = req.body;
        const denyRoles = [role, User_model_1.RoleEnum.superAdmin];
        if (req.user?.role === User_model_1.RoleEnum.admin) {
            denyRoles.push(User_model_1.RoleEnum.admin);
        }
        const user = await this.userModel.findOneAndUpdate({
            filter: {
                _id: userId,
                role: { $nin: denyRoles },
            },
            update: {
                role,
            },
        });
        if (!user) {
            throw new error_response_1.Notfound("Failed to find matching result");
        }
        return (0, success_response_1.successResponse)({ res });
    };
    sendFriendRequest = async (req, res) => {
        const { userId } = req.params;
        const checkFriendRequestExist = await this.friendRequestModel.findOne({
            filter: {
                createdBy: { $in: [req.user?._id, userId] },
                sendTo: { $in: [req.user?._id, userId] },
            },
        });
        if (checkFriendRequestExist) {
            throw new error_response_1.Conflict("Friend request already exist");
        }
        const user = await this.userModel.findOne({
            filter: { _id: userId },
        });
        if (!user) {
            throw new error_response_1.Notfound("Invalid recipient");
        }
        const [friendRequest] = (await this.friendRequestModel.create({
            data: [
                {
                    createdBy: req.user?._id,
                    sendTo: userId,
                },
            ],
        })) || [];
        if (!friendRequest) {
            throw new error_response_1.BadRequest("Something went wrong");
        }
        return (0, success_response_1.successResponse)({ res, statusCode: 201 });
    };
    acceptFriendRequest = async (req, res) => {
        const { requestId } = req.params;
        const friendRequest = await this.friendRequestModel.findOneAndUpdate({
            filter: {
                _id: requestId,
                sendTo: req.user?._id,
            },
            update: {
                acceptedAt: new Date()
            }
        });
        if (!friendRequest) {
            throw new error_response_1.Notfound("Failed to find matching result");
        }
        await Promise.all([
            await this.userModel.updateOne({
                filter: { _id: friendRequest.sendTo },
                update: {
                    $addToSet: { friends: friendRequest.createdBy }
                }
            })
        ]);
        return (0, success_response_1.successResponse)({ res });
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
                    data: [
                        {
                            jti: req.decoded?.jti,
                            expiresIn: req.decoded?.iat +
                                Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
                            userId: req.decoded?._id,
                        },
                    ],
                });
                await (0, token_security_1.createRevokeToken)(req.decoded);
                statusCode = 201;
                break;
        }
        await this.userModel.updateOne({
            filter: { _id: req.decoded?._id },
            update,
        });
        return res.status(statusCode).json({ message: "Done" });
    };
    refreshToken = async (req, res) => {
        const credentials = await (0, token_security_1.loginCredentials)(req.user);
        await (0, token_security_1.createRevokeToken)(req.decoded);
        return (0, success_response_1.successResponse)({
            res,
            statusCode: 201,
            data: { credentials },
        });
    };
    profileImg = async (req, res) => {
        const { ContentType, originalname, } = req.body;
        const { url, key } = await (0, s3_config_1.createPreSignUploadLink)({
            ContentType,
            originalname,
            path: `users/${req.decoded?._id}`,
        });
        const user = await this.userModel.findByIdAndUpdate({
            id: req.user?._id,
            update: {
                profileImg: key,
                tempProfileImg: req.user?.profileImg,
            },
        });
        if (!user) {
            throw new error_response_1.BadRequest("Failed to update user profile image");
        }
        s3_multer_1.s3Event.emit("trackProfileImgUpload", {
            userId: req.user?._id,
            oldKey: req.user?.profileImg,
            key,
            expiresIn: 30000,
        });
        return (0, success_response_1.successResponse)({ res, data: { url } });
    };
    profileCoverImg = async (req, res) => {
        const urls = await (0, s3_config_1.uploadFiles)({
            files: req.files,
            path: `users/${req.decoded?._id}/cover`,
            isLarge: true,
        });
        const user = this.userModel.findByIdAndUpdate({
            id: req.user?._id,
            update: {
                coverImgs: urls,
            },
        });
        if (!user) {
            throw new error_response_1.BadRequest("Failed to update profile cover images");
        }
        if (req.user?.coverImgs) {
            await (0, s3_config_1.deleteFiles)({ urls: req.user.coverImgs });
        }
        return (0, success_response_1.successResponse)({ res });
    };
    freezeAccount = async (req, res) => {
        const { userId } = req.params || {};
        if (userId && req.user?.role !== User_model_1.RoleEnum.admin) {
            throw new error_response_1.Forbidden("Not authorized user");
        }
        const user = await this.userModel.updateOne({
            filter: {
                _id: userId || req.user?._id,
                freezedAt: { $exists: false },
            },
            update: {
                freezedAt: new Date(),
                freezedBy: req.user?._id,
                changeCredentialsTime: new Date(),
                $unset: {
                    restoredAt: 1,
                    restoredBy: 1,
                },
            },
        });
        if (!user.matchedCount) {
            throw new error_response_1.Notfound("User not found or Failed to freeze this resource");
        }
        return (0, success_response_1.successResponse)({ res });
    };
    restoreAccount = async (req, res) => {
        const { userId } = req.params;
        const user = await this.userModel.updateOne({
            filter: {
                _id: userId,
                freezedBy: { $ne: userId },
            },
            update: {
                restoredAt: new Date(),
                restoredBy: req.user?._id,
                $unset: {
                    freezedAt: 1,
                    freezedBy: 1,
                },
            },
        });
        if (!user.matchedCount) {
            throw new error_response_1.Notfound("User not found or Failed to restore this resource");
        }
        return res.json({ message: "Done" });
    };
    hardDeleteAccount = async (req, res) => {
        const { userId } = req.params;
        const user = await this.userModel.deleteOne({
            filter: {
                _id: userId,
                freezedAt: { $exists: true },
            },
        });
        if (!user.deletedCount) {
            throw new error_response_1.Notfound("user not found or hard delete this resource");
        }
        await (0, s3_config_1.deleteFolderByPrefix)({ path: `users/${userId}` });
        return res.json({ message: "Done" });
    };
}
exports.default = new userService();
