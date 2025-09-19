"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postService = exports.postAvailability = void 0;
const success_response_1 = require("../utils/response/success.response");
const Post_model_1 = require("../../DB/models/Post.model");
const repository_1 = require("../../DB/repository");
const User_model_1 = require("../../DB/models/User.model");
const error_response_1 = require("../utils/response/error.response");
const s3_config_1 = require("../utils/multer/s3.config");
const uuid_1 = require("uuid");
const postAvailability = (req) => {
    return [
        { availability: Post_model_1.AvailabilityEnum.public },
        { availability: Post_model_1.AvailabilityEnum.onlyMe, createdBy: req.user?._id },
        { availability: Post_model_1.AvailabilityEnum.friends, createdBy: { $in: [...(req.user?.friends || []), req.user?._id] } },
        { availability: { $ne: Post_model_1.AvailabilityEnum.onlyMe }, tags: { $in: req.user?._id } },
    ];
};
exports.postAvailability = postAvailability;
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
    updatePost = async (req, res) => {
        const { postId } = req.params;
        const post = await this.postModel.findOne({
            filter: {
                _id: postId,
                createdBy: req.user?._id
            }
        });
        if (!post) {
            throw new error_response_1.Notfound("Fail to find matching result");
        }
        if (req.body.tags?.length && (await this.userModel.find({ filter: { _id: { $in: req.body.tags }, paranoid: false } })).length !== req.body.tags.length) {
            throw new error_response_1.Notfound("Some of the mentioned users doesn't exist");
        }
        let attachments = [];
        if (req.files?.length) {
            attachments = await (0, s3_config_1.uploadFiles)({ files: req.files, path: `users/${post.createdBy}/post/${assetsFolderId}` });
        }
        const updatedPost = await this.postModel.updateOne({
            filter: {
                _id: post._id
            },
            update: {
                content: req.body.content,
                allowComments: req.body.allowComments || post.allowComments,
                availability: req.body.availability || post.availability,
                $addToSet: { attachments: { $each: attachments || [] }, tags: { $each: req.body.tags || [] } },
                $pull: { attachments: { $in: req.body.removedAttachments }, tags: { $in: req.body.removedTags } },
            }
        });
        if (!updatedPost.matchedCount) {
            if (attachments.length) {
                await (0, s3_config_1.deleteFiles)({ urls: attachments });
            }
            throw new error_response_1.BadRequest("Failed to generate this post");
        }
        else {
            if (req.body.removedAttachments?.length) {
                await (0, s3_config_1.deleteFiles)({ urls: req.body.removedAttachments });
            }
        }
        return (0, success_response_1.successResponse)({ res, statusCode: 201 });
    };
    likePost = async (req, res) => {
        const { postId } = req.params;
        const { action } = req.query;
        let update = { $addToSet: { likes: req.user?._id } };
        if (action === Post_model_1.LikeActionEnum.unlike) {
            update = { $pull: { likes: req.user?._id } };
        }
        const post = await this.postModel.findOneAndUpdate({
            filter: { _id: postId,
                $or: (0, exports.postAvailability)(req)
            },
            update
        });
        if (!post) {
            throw new error_response_1.Notfound("Invalid postId or post doesn't exist");
        }
        return (0, success_response_1.successResponse)({ res });
    };
}
exports.postService = new PostService();
