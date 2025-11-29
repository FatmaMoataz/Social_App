"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthContext = void 0;
const graphql_1 = require("graphql");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthContext {
    static createContext(authHeader) {
        if (!authHeader) {
            return { isAuthenticated: false };
        }
        try {
            const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
            const secret = process.env.ACCESS_USER_TOKEN_SIGNATURE || 'sjkajnwoi3User';
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            return {
                user: decoded,
                isAuthenticated: true
            };
        }
        catch (error) {
            throw new graphql_1.GraphQLError('Invalid or expired token', {
                extensions: { code: 'UNAUTHENTICATED', statusCode: 401 }
            });
        }
    }
    static requireAuth(context) {
        if (!context.isAuthenticated || !context.user) {
            throw new graphql_1.GraphQLError('Authentication required', {
                extensions: { code: 'UNAUTHENTICATED', statusCode: 401 }
            });
        }
        return context.user;
    }
    static requireRole(context, role) {
        const user = this.requireAuth(context);
        if (user.role !== role) {
            throw new graphql_1.GraphQLError('Insufficient permissions', {
                extensions: { code: 'FORBIDDEN', statusCode: 403 }
            });
        }
        return user;
    }
}
exports.AuthContext = AuthContext;
