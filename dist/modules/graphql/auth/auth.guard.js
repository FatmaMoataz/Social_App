"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = void 0;
const graphql_1 = require("graphql");
exports.AuthGuard = {
    isAuthenticated: (context) => {
        if (!context.isAuthenticated) {
            throw new graphql_1.GraphQLError('Authentication required', {
                extensions: { code: 'UNAUTHENTICATED', statusCode: 401 }
            });
        }
    },
    hasRole: (context, role) => {
        exports.AuthGuard.isAuthenticated(context);
        if (context.user?.role !== role) {
            throw new graphql_1.GraphQLError('Insufficient permissions', {
                extensions: { code: 'FORBIDDEN', statusCode: 403 }
            });
        }
    },
    isOwner: (context, ownerId) => {
        exports.AuthGuard.isAuthenticated(context);
        if (context.user?.userId !== ownerId && context.user?.role !== 'admin') {
            throw new graphql_1.GraphQLError('Access denied', {
                extensions: { code: 'FORBIDDEN', statusCode: 403 }
            });
        }
    }
};
