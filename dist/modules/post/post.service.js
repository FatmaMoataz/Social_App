"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const success_response_1 = require("../utils/response/success.response");
const Post_model_1 = require("../../DB/models/Post.model");
const repository_1 = require("../../DB/repository");
const User_model_1 = require("../../DB/models/User.model");
const error_response_1 = require("../utils/response/error.response");
const s3_config_1 = require("../utils/multer/s3.config");
const uuid_1 = require("uuid");
class PostService {
    userModel = new repository_1.UserRepository(User_model_1.UserModel);
    postModel = new repository_1.PostRepository(Post_model_1.PostModel);
    constructor() { }
    createPost = async (req, res) => {
        if (req.body.tags?.length && (await this.userModel.find({ filter: { _id: { $in: req.body.tags }, paranoid: false } })).length !== req.body.tags.length) {
            throw new error_response_1.Notfound("Some of the mentioned users doesn't exist");
        }
        let attachments = [];
        let assetsFolderId = (0, uuid_1.v4)();
        if (req.files?.length) {
            attachments = await (0, s3_config_1.uploadFiles)({ files: req.files, path: `users/${req.user?._id}/post/${assetsFolderId}` });
        }
        const [post] = await this.postModel.create({
            data: [
                {
                    ...req.body,
                    attachments,
                    assetsFolderId,
                    createdBy: req.user?._id
                }
            ]
        }) || [];
        if (!post) {
            if (attachments.length) {
                await (0, s3_config_1.deleteFiles)({ urls: attachments });
            }
            throw new error_response_1.BadRequest("Failed to create this post");
        }
        return (0, success_response_1.successResponse)({ res, statusCode: 201 });
    };
}
exports.default = new PostService;
