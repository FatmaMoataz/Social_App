import { IGraphQLContext } from "../context";

export interface IAuthGraph {
  // Authentication methods
  login(input: { email: string; password: string }): Promise<any>;
  register(input: { name: string; email: string; password: string; gender: string }): Promise<any>;
  logout(token: string): Promise<any>;
  refreshToken(token: string): Promise<any>;
  
  // User methods
  getCurrentUser(context: IGraphQLContext): Promise<any>;
  updateUserProfile(context: IGraphQLContext, input: any): Promise<any>;
  
  // Authorization methods
  hasPermission(context: IGraphQLContext, permission: string): boolean;
  hasRole(context: IGraphQLContext, role: string): boolean;
}

export interface IUserGraph {
  getUsers(page: number, limit: number): Promise<any>;
  getUserById(id: number): Promise<any>;
  followUser(context: IGraphQLContext, userId: number): Promise<any>;
  getFollowers(userId: number): Promise<any>;
}

export interface IPostGraph {
  getPosts(page: number, limit: number): Promise<any>;
  getPostById(id: number): Promise<any>;
  createPost(context: IGraphQLContext, input: any): Promise<any>;
  likePost(context: IGraphQLContext, postId: number): Promise<any>;
  addComment(context: IGraphQLContext, input: any): Promise<any>;
}