import { GraphQLNonNull, GraphQLInt, GraphQLID } from "graphql";
import { PostType, PostListType, PostInputType, CommentInputType, CommentType, ResponseMessageType } from "../types";
import { PostResolver } from "../resolvers";

export const PostSchema = {
  queries: {
    posts: {
      type: PostListType,
      args: {
        page: { type: GraphQLInt, defaultValue: 1 },
        limit: { type: GraphQLInt, defaultValue: 10 }
      },
      resolve: PostResolver.Query.posts
    },
    post: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: PostResolver.Query.post
    }
  },

  mutations: {
    createPost: {
      type: PostType,
      args: {
        input: { type: new GraphQLNonNull(PostInputType) }
      },
      resolve: PostResolver.Mutation.createPost
    },
    likePost: {
      type: ResponseMessageType,
      args: {
        postId: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: PostResolver.Mutation.likePost
    },
    addComment: {
      type: CommentType,
      args: {
        input: { type: new GraphQLNonNull(CommentInputType) }
      },
      resolve: PostResolver.Mutation.addComment
    }
  }
};