import { GraphQLError } from "graphql";
import { IGraphQLContext } from "../context";

export const AuthGuard = {
  isAuthenticated: (context: IGraphQLContext) => {
    if (!context.isAuthenticated) {
      throw new GraphQLError('Authentication required', {
        extensions: { code: 'UNAUTHENTICATED', statusCode: 401 }
      });
    }
  },

  hasRole: (context: IGraphQLContext, role: string) => {
    AuthGuard.isAuthenticated(context);
    
    if (context.user?.role !== role) {
      throw new GraphQLError('Insufficient permissions', {
        extensions: { code: 'FORBIDDEN', statusCode: 403 }
      });
    }
  },

  isOwner: (context: IGraphQLContext, ownerId: number) => {
    AuthGuard.isAuthenticated(context);
    
    if (context.user?.userId !== ownerId && context.user?.role !== 'admin') {
      throw new GraphQLError('Access denied', {
        extensions: { code: 'FORBIDDEN', statusCode: 403 }
      });
    }
  }
};