"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const success_response_1 = require("../utils/response/success.response");
const repository_1 = require("../../DB/repository");
const models_1 = require("../../DB/models");
const post_1 = require("../post");
const error_response_1 = require("../utils/response/error.response");
const s3_config_1 = require("../utils/multer/s3.config");
class CommentService {
    userModel = new repository_1.UserRepository(models_1.UserModel);
    postModel = new repository_1.PostRepository(models_1.PostModel);
    commentModel = new repository_1.CommentRepository(models_1.CommentModel);
    constructor() { }
    createComment = async (req, res) => {
        const { postId } = req.params;
        const post = await this.postModel.findOne({
            filter: {
                _id: postId,
                allowComments: models_1.AllowCommentsEnum.allow,
                $or: (0, post_1.postAvailability)(req)
            }
        });
        if (!post) {
            throw new error_response_1.Notfound("Failed to find matching result");
        }
        if (req.body.tags?.length && (await this.userModel.find({ filter: { _id: { $in: req.body.tags }, paranoid: false } })).length !== req.body.tags.length) {
            throw new error_response_1.Notfound("Some of the mentioned users doesn't exist");
        }
        let attachments = [];
        if (req.files?.length) {
            attachments = await (0, s3_config_1.uploadFiles)({ files: req.files, path: `users/${post.createdBy}/post/${post.assetsFolderId}` });
        }
        const [comment] = await this.commentModel.create({
            data: [
                {
                    ...req.body,
                    attachments,
                    postId,
                    createdBy: req.user?._id
                }
            ]
        }) || [];
        if (!comment) {
            if (attachments.length) {
                await (0, s3_config_1.deleteFiles)({ urls: attachments });
            }
            throw new error_response_1.BadRequest("Failed to create this comment");
        }
        return (0, success_response_1.successResponse)({ res, statusCode: 201 });
    };
    replyOnComment = async (req, res) => {
        const { postId, commentId } = req.params;
        const comment = await this.commentModel.findOne({
            filter: {
                _id: commentId,
                postId,
            },
            options: {
                populate: [{ path: "postId", match: {
                            allowComments: models_1.AllowCommentsEnum.allow,
                            $or: (0, post_1.postAvailability)(req)
                        } }]
            }
        });
        if (!comment?.postId) {
            throw new error_response_1.Notfound("Failed to find matching result");
        }
        if (req.body.tags?.length && (await this.userModel.find({ filter: { _id: { $in: req.body.tags }, paranoid: false } })).length !== req.body.tags.length) {
            throw new error_response_1.Notfound("Some of the mentioned users doesn't exist");
        }
        let attachments = [];
        if (req.files?.length) {
            const post = comment.postId;
            attachments = await (0, s3_config_1.uploadFiles)({ files: req.files, path: `users/${post.createdBy}/post/${post.assetsFolderId}` });
        }
        const [reply] = await this.commentModel.create({
            data: [
                {
                    ...req.body,
                    attachments,
                    postId,
                    commentId,
                    createdBy: req.user?._id
                }
            ]
        }) || [];
        if (!reply) {
            if (attachments.length) {
                await (0, s3_config_1.deleteFiles)({ urls: attachments });
            }
            throw new error_response_1.BadRequest("Failed to create this comment");
        }
        return (0, success_response_1.successResponse)({ res, statusCode: 201 });
    };
}
exports.default = new CommentService();
