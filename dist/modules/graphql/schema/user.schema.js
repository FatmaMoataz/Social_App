"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = void 0;
const graphql_1 = require("graphql");
const types_1 = require("../types");
const resolvers_1 = require("../resolvers");
exports.UserSchema = {
    queries: {
        users: {
            type: types_1.UserListType,
            args: {
                page: { type: graphql_1.GraphQLInt, defaultValue: 1 },
                limit: { type: graphql_1.GraphQLInt, defaultValue: 10 }
            },
            resolve: resolvers_1.UserResolver.Query.users
        },
        user: {
            type: types_1.UserType,
            args: {
                id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) }
            },
            resolve: resolvers_1.UserResolver.Query.user
        }
    },
    mutations: {
        followUser: {
            type: types_1.ResponseMessageType,
            args: {
                userId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) }
            },
            resolve: resolvers_1.UserResolver.Mutation.followUser
        }
    }
};
