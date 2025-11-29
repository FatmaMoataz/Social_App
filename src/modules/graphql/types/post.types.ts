import { GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLList, GraphQLID, GraphQLInt, GraphQLBoolean, GraphQLInputObjectType } from "graphql";

export interface IPost {
  id: number;
  title: string;
  content: string;
  authorId: number;
  likes: number[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment {
  id: number;
  content: string;
  authorId: number;
  postId: number;
  createdAt: Date;
}

export const CommentType = new GraphQLObjectType({
  name: "Comment",
  fields: {
    id: { type: GraphQLID },
    content: { type: GraphQLString },
    authorId: { type: GraphQLID },
    postId: { type: GraphQLID },
    createdAt: { type: GraphQLString }
  }
});

export const PostType = new GraphQLObjectType({
  name: "Post",
  fields: {
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: GraphQLID },
    likes: { type: new GraphQLList(GraphQLID) },
    likesCount: { type: GraphQLInt },
    comments: { type: new GraphQLList(CommentType) },
    isLiked: { type: GraphQLBoolean },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString }
  }
});

export const PostListType = new GraphQLObjectType({
  name: "PostList",
  fields: {
    posts: { type: new GraphQLList(PostType) },
    total: { type: GraphQLInt },
    page: { type: GraphQLInt },
    limit: { type: GraphQLInt },
    hasNext: { type: GraphQLBoolean }
  }
});

export const PostInputType = new GraphQLInputObjectType({
  name: "PostInput",
  fields: {
    title: { type: GraphQLString },
    content: { type: new GraphQLNonNull(GraphQLString) }
  }
});

export const CommentInputType = new GraphQLInputObjectType({
  name: "CommentInput",
  fields: {
    content: { type: new GraphQLNonNull(GraphQLString) },
    postId: { type: new GraphQLNonNull(GraphQLID) }
  }
});