"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostSchema = void 0;
const graphql_1 = require("graphql");
const types_1 = require("../types");
const resolvers_1 = require("../resolvers");
exports.PostSchema = {
    queries: {
        posts: {
            type: types_1.PostListType,
            args: {
                page: { type: graphql_1.GraphQLInt, defaultValue: 1 },
                limit: { type: graphql_1.GraphQLInt, defaultValue: 10 }
            },
            resolve: resolvers_1.PostResolver.Query.posts
        },
        post: {
            type: types_1.PostType,
            args: {
                id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) }
            },
            resolve: resolvers_1.PostResolver.Query.post
        }
    },
    mutations: {
        createPost: {
            type: types_1.PostType,
            args: {
                input: { type: new graphql_1.GraphQLNonNull(types_1.PostInputType) }
            },
            resolve: resolvers_1.PostResolver.Mutation.createPost
        },
        likePost: {
            type: types_1.ResponseMessageType,
            args: {
                postId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) }
            },
            resolve: resolvers_1.PostResolver.Mutation.likePost
        },
        addComment: {
            type: types_1.CommentType,
            args: {
                input: { type: new graphql_1.GraphQLNonNull(types_1.CommentInputType) }
            },
            resolve: resolvers_1.PostResolver.Mutation.addComment
        }
    }
};
