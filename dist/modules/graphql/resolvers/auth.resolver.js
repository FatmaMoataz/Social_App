"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthResolver = void 0;
const graphql_1 = require("graphql");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validation_1 = require("../validation");
const auth_1 = require("../auth");
const models_1 = require("../../../DB/models");
let users = [
    {
        id: 1,
        name: "fatma",
        email: "fatmamoataz65@gmail.com",
        gender: models_1.GenderEnum.female,
        password: "$2b$12$hashedpassword",
        followers: [],
        role: "user",
        createdAt: new Date()
    }
];
exports.AuthResolver = {
    Query: {
        me: (_, __, context) => {
            (0, auth_1.Authenticated)(_, 'me', { value: () => { } }); // Apply auth decorator
            const user = users.find(u => u.id === context.user?.userId);
            if (!user) {
                throw new graphql_1.GraphQLError('User not found', {
                    extensions: { code: 'NOT_FOUND', statusCode: 404 }
                });
            }
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
    },
    Mutation: {
        register: async (_, { input }) => {
            try {
                // Validation
                validation_1.UserValidation.validateEmail(input.email);
                validation_1.UserValidation.validatePassword(input.password);
                validation_1.UserValidation.validateName(input.name);
                // Check if user exists
                const existingUser = users.find(u => u.email === input.email);
                if (existingUser) {
                    throw new graphql_1.GraphQLError('User already exists', {
                        extensions: { code: 'CONFLICT', statusCode: 409 }
                    });
                }
                // Hash password
                const hashedPassword = await bcrypt_1.default.hash(input.password, parseInt(process.env.SALT || '12'));
                // Create user
                const newUser = {
                    id: users.length + 1,
                    name: input.name,
                    email: input.email,
                    gender: input.gender,
                    password: hashedPassword,
                    followers: [],
                    role: 'user',
                    createdAt: new Date()
                };
                users.push(newUser);
                // Generate tokens
                const tokenPayload = { userId: newUser.id, email: newUser.email, role: newUser.role };
                const token = jsonwebtoken_1.default.sign(tokenPayload, process.env.ACCESS_USER_TOKEN_SIGNATURE, {
                    expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN || '3600')
                });
                const refreshToken = jsonwebtoken_1.default.sign(tokenPayload, process.env.REFRESH_USER_TOKEN_SIGNATURE, {
                    expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN || '315366000')
                });
                const { password, ...userWithoutPassword } = newUser;
                return {
                    success: true,
                    message: 'Registration successful',
                    token,
                    refreshToken,
                    user: userWithoutPassword,
                    statusCode: 201
                };
            }
            catch (error) {
                throw error;
            }
        },
        login: async (_, { input }) => {
            try {
                validation_1.UserValidation.validateEmail(input.email);
                const user = users.find(u => u.email === input.email);
                if (!user) {
                    throw new graphql_1.GraphQLError('Invalid credentials', {
                        extensions: { code: 'UNAUTHENTICATED', statusCode: 401 }
                    });
                }
                const isPasswordValid = await bcrypt_1.default.compare(input.password, user.password);
                if (!isPasswordValid) {
                    throw new graphql_1.GraphQLError('Invalid credentials', {
                        extensions: { code: 'UNAUTHENTICATED', statusCode: 401 }
                    });
                }
                const tokenPayload = { userId: user.id, email: user.email, role: user.role };
                const token = jsonwebtoken_1.default.sign(tokenPayload, process.env.ACCESS_USER_TOKEN_SIGNATURE, {
                    expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN || '3600')
                });
                const refreshToken = jsonwebtoken_1.default.sign(tokenPayload, process.env.REFRESH_USER_TOKEN_SIGNATURE, {
                    expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN || '315366000')
                });
                const { password, ...userWithoutPassword } = user;
                return {
                    success: true,
                    message: 'Login successful',
                    token,
                    refreshToken,
                    user: userWithoutPassword,
                    statusCode: 200
                };
            }
            catch (error) {
                throw error;
            }
        }
    }
};
