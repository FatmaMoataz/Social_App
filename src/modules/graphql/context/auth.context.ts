import { GraphQLError } from "graphql";
import jwt from 'jsonwebtoken';

export interface IAuthUser {
  userId: number;
  email: string;
  role?: string;
}

export interface IGraphQLContext {
  user?: IAuthUser;
  isAuthenticated: boolean;
}

export class AuthContext {
  static createContext(authHeader?: string): IGraphQLContext {
    if (!authHeader) {
      return { isAuthenticated: false };
    }

    try {
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
      const secret = process.env.ACCESS_USER_TOKEN_SIGNATURE || 'sjkajnwoi3User';
      
      const decoded = jwt.verify(token, secret) as IAuthUser;
      
      return {
        user: decoded,
        isAuthenticated: true
      };
    } catch (error) {
      throw new GraphQLError('Invalid or expired token', {
        extensions: { code: 'UNAUTHENTICATED', statusCode: 401 }
      });
    }
  }

  static requireAuth(context: IGraphQLContext): IAuthUser {
    if (!context.isAuthenticated || !context.user) {
      throw new GraphQLError('Authentication required', {
        extensions: { code: 'UNAUTHENTICATED', statusCode: 401 }
      });
    }
    return context.user;
  }

  static requireRole(context: IGraphQLContext, role: string): IAuthUser {
    const user = this.requireAuth(context);
    
    if (user.role !== role) {
      throw new GraphQLError('Insufficient permissions', {
        extensions: { code: 'FORBIDDEN', statusCode: 403 }
      });
    }
    
    return user;
  }
}