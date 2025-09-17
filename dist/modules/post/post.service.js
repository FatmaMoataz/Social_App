"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const success_response_1 = require("../utils/response/success.response");
const Post_model_1 = require("../../DB/models/Post.model");
const repository_1 = require("../../DB/repository");
const User_model_1 = require("../../DB/models/User.model");
class PostService {
    userModel = new repository_1.UserRepository(User_model_1.UserModel);
    postModel = new repository_1.PostRepository(Post_model_1.PostModel);
    constructor() { }
    createPost = async (req, res) => {
        return (0, success_response_1.successResponse)({ res, statusCode: 201 });
    };
}
exports.default = new PostService;
