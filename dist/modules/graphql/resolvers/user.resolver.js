"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const graphql_1 = require("graphql");
const auth_1 = require("../auth");
const models_1 = require("../../../DB/models");
// Mock data
let users = [
    {
        id: 1,
        name: "fatma",
        email: "fatmamoataz65@gmail.com",
        gender: models_1.GenderEnum.female,
        password: "hashed",
        followers: [2, 3],
        role: "user",
        createdAt: new Date()
    },
    {
        id: 2,
        name: "moataz",
        email: "moataz@example.com",
        gender: models_1.GenderEnum.male,
        password: "hashed",
        followers: [1],
        role: "user",
        createdAt: new Date()
    }
];
exports.UserResolver = {
    Query: {
        users: (_, { page = 1, limit = 10 }, context) => {
            (0, auth_1.Authenticated)(_, 'users', { value: () => { } });
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedUsers = users.slice(startIndex, endIndex);
            const usersWithoutPasswords = paginatedUsers.map(({ password, ...user }) => user);
            return {
                users: usersWithoutPasswords,
                total: users.length
            };
        },
        user: (_, { id }, context) => {
            (0, auth_1.Authenticated)(_, 'user', { value: () => { } });
            const user = users.find(u => u.id === parseInt(id));
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
        followUser: (_, { userId }, context) => {
            (0, auth_1.Authenticated)(_, 'followUser', { value: () => { } });
            const currentUserId = context.user.userId;
            const userToFollow = users.find(u => u.id === parseInt(userId));
            if (!userToFollow) {
                throw new graphql_1.GraphQLError('User not found', {
                    extensions: { code: 'NOT_FOUND', statusCode: 404 }
                });
            }
            if (userToFollow.id === currentUserId) {
                throw new graphql_1.GraphQLError('Cannot follow yourself', {
                    extensions: { code: 'BAD_REQUEST', statusCode: 400 }
                });
            }
            if (!userToFollow.followers.includes(currentUserId)) {
                userToFollow.followers.push(currentUserId);
            }
            return {
                success: true,
                message: 'User followed successfully',
                statusCode: 200
            };
        }
    }
};
