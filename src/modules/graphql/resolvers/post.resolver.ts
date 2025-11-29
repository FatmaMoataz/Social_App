import { GraphQLError } from "graphql";
import { IGraphQLContext } from "../context";
import { Authenticated } from "../auth";
import { PostValidation } from "../validation";
import { IPost, IComment } from "../types";

// Mock data
let posts: IPost[] = [
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

let comments: IComment[] = [];
let postIdCounter = 3;
let commentIdCounter = 1;

export const PostResolver = {
  Query: {
    posts: (_: unknown, { page = 1, limit = 10 }: any, context: IGraphQLContext) => {
      Authenticated(_, 'posts', { value: () => {} });

      PostValidation.validatePagination(page, limit);

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

    post: (_: unknown, { id }: any, context: IGraphQLContext) => {
      Authenticated(_, 'post', { value: () => {} });

      const post = posts.find(p => p.id === parseInt(id));
      if (!post) {
        throw new GraphQLError('Post not found', {
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
    createPost: (_: unknown, { input }: any, context: IGraphQLContext) => {
      Authenticated(_, 'createPost', { value: () => {} });

      PostValidation.validateContent(input.content);

      const newPost: IPost = {
        id: postIdCounter++,
        title: input.title || '',
        content: input.content,
        authorId: context.user!.userId,
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

    likePost: (_: unknown, { postId }: any, context: IGraphQLContext) => {
      Authenticated(_, 'likePost', { value: () => {} });

      const post = posts.find(p => p.id === parseInt(postId));
      if (!post) {
        throw new GraphQLError('Post not found', {
          extensions: { code: 'NOT_FOUND', statusCode: 404 }
        });
      }

      const userId = context.user!.userId;
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
      } else {
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

    addComment: (_: unknown, { input }: any, context: IGraphQLContext) => {
      Authenticated(_, 'addComment', { value: () => {} });

      PostValidation.validateContent(input.content);

      const post = posts.find(p => p.id === parseInt(input.postId));
      if (!post) {
        throw new GraphQLError('Post not found', {
          extensions: { code: 'NOT_FOUND', statusCode: 404 }
        });
      }

      const newComment: IComment = {
        id: commentIdCounter++,
        content: input.content,
        authorId: context.user!.userId,
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