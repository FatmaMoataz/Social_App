"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthResponseType = exports.LoginInputType = exports.UserInputType = exports.UserListType = exports.UserType = void 0;
const graphql_1 = require("graphql");
exports.UserType = new graphql_1.GraphQLObjectType({
    name: "User",
    fields: {
        id: { type: graphql_1.GraphQLID },
        name: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        email: { type: graphql_1.GraphQLString },
        gender: { type: graphql_1.GraphQLString },
        followers: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
        role: { type: graphql_1.GraphQLString },
        createdAt: { type: graphql_1.GraphQLString }
    }
});
exports.UserListType = new graphql_1.GraphQLObjectType({
    name: "UserList",
    fields: {
        users: { type: new graphql_1.GraphQLList(exports.UserType) },
        total: { type: graphql_1.GraphQLInt }
    }
});
exports.UserInputType = new graphql_1.GraphQLInputObjectType({
    name: "UserInput",
    fields: {
        name: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        email: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        password: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        gender: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) }
    }
});
exports.LoginInputType = new graphql_1.GraphQLInputObjectType({
    name: "LoginInput",
    fields: {
        email: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        password: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) }
    }
});
exports.AuthResponseType = new graphql_1.GraphQLObjectType({
    name: "AuthResponse",
    fields: {
        success: { type: graphql_1.GraphQLBoolean },
        message: { type: graphql_1.GraphQLString },
        token: { type: graphql_1.GraphQLString },
        refreshToken: { type: graphql_1.GraphQLString },
        user: { type: exports.UserType },
        statusCode: { type: graphql_1.GraphQLInt }
    }
});
