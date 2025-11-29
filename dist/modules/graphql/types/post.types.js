"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentInputType = exports.PostInputType = exports.PostListType = exports.PostType = exports.CommentType = void 0;
const graphql_1 = require("graphql");
exports.CommentType = new graphql_1.GraphQLObjectType({
    name: "Comment",
    fields: {
        id: { type: graphql_1.GraphQLID },
        content: { type: graphql_1.GraphQLString },
        authorId: { type: graphql_1.GraphQLID },
        postId: { type: graphql_1.GraphQLID },
        createdAt: { type: graphql_1.GraphQLString }
    }
});
exports.PostType = new graphql_1.GraphQLObjectType({
    name: "Post",
    fields: {
        id: { type: graphql_1.GraphQLID },
        title: { type: graphql_1.GraphQLString },
        content: { type: graphql_1.GraphQLString },
        authorId: { type: graphql_1.GraphQLID },
        likes: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
        likesCount: { type: graphql_1.GraphQLInt },
        comments: { type: new graphql_1.GraphQLList(exports.CommentType) },
        isLiked: { type: graphql_1.GraphQLBoolean },
        createdAt: { type: graphql_1.GraphQLString },
        updatedAt: { type: graphql_1.GraphQLString }
    }
});
exports.PostListType = new graphql_1.GraphQLObjectType({
    name: "PostList",
    fields: {
        posts: { type: new graphql_1.GraphQLList(exports.PostType) },
        total: { type: graphql_1.GraphQLInt },
        page: { type: graphql_1.GraphQLInt },
        limit: { type: graphql_1.GraphQLInt },
        hasNext: { type: graphql_1.GraphQLBoolean }
    }
});
exports.PostInputType = new graphql_1.GraphQLInputObjectType({
    name: "PostInput",
    fields: {
        title: { type: graphql_1.GraphQLString },
        content: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) }
    }
});
exports.CommentInputType = new graphql_1.GraphQLInputObjectType({
    name: "CommentInput",
    fields: {
        content: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        postId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) }
    }
});
