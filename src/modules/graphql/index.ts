// Core exports
export { RootSchema } from './schema.root';

// Context exports
export { AuthContext, type IGraphQLContext, type IAuthUser } from './context';

// Auth exports
export { AuthGuard } from './auth/auth.guard';
export { Authenticated, Authorized, OwnerOnly } from './auth/auth.decorator';

// Validation exports
export { UserValidation, PostValidation } from './validation';

// Type exports
export type { IUser, IPost, IComment } from './types';
export { 
  UserType, UserListType, UserInputType, LoginInputType, AuthResponseType, 
  PostType, PostListType, PostInputType, CommentType, CommentInputType,
  PaginationInfoType, ResponseMessageType 
} from './types';

// Resolver exports
export { AuthResolver, UserResolver, PostResolver } from './resolvers';

// Socket exports
export { SocketHandlers } from './socket';

// Schema instance
import { RootSchema } from './schema.root';
export const schema = RootSchema.createSchema();