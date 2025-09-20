"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const success_response_1 = require("../utils/response/success.response");
const repository_1 = require("../../DB/repository");
const models_1 = require("../../DB/models");
class CommentService {
    userModel = new repository_1.UserRepository(models_1.UserModel);
    postModel = new repository_1.PostRepository(models_1.PostModel);
    commentModel = new repository_1.CommentRepository(models_1.CommentModel);
    constructor() { }
    createComment = async (req, res) => {
        return (0, success_response_1.successResponse)({ res, statusCode: 201 });
    };
}
exports.default = new CommentService();
