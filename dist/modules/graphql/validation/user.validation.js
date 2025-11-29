"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostValidation = exports.UserValidation = void 0;
const graphql_1 = require("graphql");
class UserValidation {
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new graphql_1.GraphQLError('Invalid email format', {
                extensions: { code: 'VALIDATION_ERROR', statusCode: 400 }
            });
        }
    }
    static validatePassword(password) {
        if (password.length < 8) {
            throw new graphql_1.GraphQLError('Password must be at least 8 characters long', {
                extensions: { code: 'VALIDATION_ERROR', statusCode: 400 }
            });
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            throw new graphql_1.GraphQLError('Password must contain uppercase, lowercase letters and numbers', {
                extensions: { code: 'VALIDATION_ERROR', statusCode: 400 }
            });
        }
    }
    static validateName(name) {
        if (name.length < 2) {
            throw new graphql_1.GraphQLError('Name must be at least 2 characters long', {
                extensions: { code: 'VALIDATION_ERROR', statusCode: 400 }
            });
        }
        if (name.length > 50) {
            throw new graphql_1.GraphQLError('Name must not exceed 50 characters', {
                extensions: { code: 'VALIDATION_ERROR', statusCode: 400 }
            });
        }
    }
}
exports.UserValidation = UserValidation;
class PostValidation {
    static validateContent(content) {
        if (!content || content.trim().length === 0) {
            throw new graphql_1.GraphQLError('Post content cannot be empty', {
                extensions: { code: 'VALIDATION_ERROR', statusCode: 400 }
            });
        }
        if (content.length > 1000) {
            throw new graphql_1.GraphQLError('Post content must not exceed 1000 characters', {
                extensions: { code: 'VALIDATION_ERROR', statusCode: 400 }
            });
        }
    }
    static validatePagination(page, limit) {
        if (page < 1) {
            throw new graphql_1.GraphQLError('Page must be at least 1', {
                extensions: { code: 'VALIDATION_ERROR', statusCode: 400 }
            });
        }
        if (limit < 1 || limit > 100) {
            throw new graphql_1.GraphQLError('Limit must be between 1 and 100', {
                extensions: { code: 'VALIDATION_ERROR', statusCode: 400 }
            });
        }
    }
}
exports.PostValidation = PostValidation;
