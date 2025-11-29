"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostResolver = void 0;
const graphql_1 = require("graphql");
const auth_1 = require("../auth");
const validation_1 = require("../validation");
// Mock data
let posts = [
    {
        id: 1,
        title: "First Post",
        content: "This is my first post!",
        authorId: 1,
        likes: [2, 3],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 2,
        title: "Second Post",
        content: "Another interesting post!",
        authorId: 2,
        likes: [1],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
    }
];
let comments = [];
let postIdCounter = 3;
let commentIdCounter = 1;
exports.PostResolver = {
    Query: {
        posts: (_, { page = 1, limit = 10 }, context) => {
            (0, auth_1.Authenticated)(_, 'posts', { value: () => { } });
            validation_1.PostValidation.validatePagination(page, limit);
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedPosts = posts.slice(startIndex, endIndex).map(post => ({
                ...post,
                likesCount: post.likes.length,
                isLiked: context.user ? post.likes.includes(context.user.userId) : false
            }));
            return {
                posts: paginatedPosts,
                total: posts.length,
                page,
                limit,
                hasNext: endIndex < posts.length
            };
        },
        post: (_, { id }, context) => {
            (0, auth_1.Authenticated)(_, 'post', { value: () => { } });
            const post = posts.find(p => p.id === parseInt(id));
            if (!post) {
                throw new graphql_1.GraphQLError('Post not found', {
                    extensions: { code: 'NOT_FOUND', statusCode: 404 }
                });
            }
            return {
                ...post,
                likesCount: post.likes.length,
                isLiked: context.user ? post.likes.includes(context.user.userId) : false
            };
        }
    },
    Mutation: {
        createPost: (_, { input }, context) => {
            (0, auth_1.Authenticated)(_, 'createPost', { value: () => { } });
            validation_1.PostValidation.validateContent(input.content);
            const newPost = {
                id: postIdCounter++,
                title: input.title || '',
                content: input.content,
                authorId: context.user.userId,
                likes: [],
                comments: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            posts.unshift(newPost); // Add to beginning for chronological order
            return {
                ...newPost,
                likesCount: 0,
                isLiked: false
            };
        },
        likePost: (_, { postId }, context) => {
            (0, auth_1.Authenticated)(_, 'likePost', { value: () => { } });
            const post = posts.find(p => p.id === parseInt(postId));
            if (!post) {
                throw new graphql_1.GraphQLError('Post not found', {
                    extensions: { code: 'NOT_FOUND', statusCode: 404 }
                });
            }
            const userId = context.user.userId;
            const likeIndex = post.likes.indexOf(userId);
            if (likeIndex === -1) {
                // Like the post
                post.likes.push(userId);
                // Emit socket event for real-time updates
                // socketIo.emit('postLiked', { postId, userId, likesCount: post.likes.length });
                return {
                    success: true,
                    message: 'Post liked successfully',
                    statusCode: 200
                };
            }
            else {
                // Unlike the post
                post.likes.splice(likeIndex, 1);
                // Emit socket event for real-time updates
                // socketIo.emit('postUnliked', { postId, userId, likesCount: post.likes.length });
                return {
                    success: true,
                    message: 'Post unliked successfully',
                    statusCode: 200
                };
            }
        },
        addComment: (_, { input }, context) => {
            (0, auth_1.Authenticated)(_, 'addComment', { value: () => { } });
            validation_1.PostValidation.validateContent(input.content);
            const post = posts.find(p => p.id === parseInt(input.postId));
            if (!post) {
                throw new graphql_1.GraphQLError('Post not found', {
                    extensions: { code: 'NOT_FOUND', statusCode: 404 }
                });
            }
            const newComment = {
                id: commentIdCounter++,
                content: input.content,
                authorId: context.user.userId,
                postId: parseInt(input.postId),
                createdAt: new Date()
            };
            comments.push(newComment);
            post.comments.push(newComment);
            // Emit socket event for real-time updates
            //   socketIo.emit('commentAdded', { postId: input.postId, comment: newComment });
            return newComment;
        }
    }
};
