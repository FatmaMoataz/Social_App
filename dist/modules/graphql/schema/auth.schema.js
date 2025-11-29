"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthSchema = void 0;
const graphql_1 = require("graphql");
const types_1 = require("../types");
const resolvers_1 = require("../resolvers");
exports.AuthSchema = {
    queries: {
        me: {
            type: new graphql_1.GraphQLObjectType({
                name: "AuthQuery",
                fields: {
                    me: { type: new graphql_1.GraphQLObjectType({
                            name: "Me",
                            fields: {
                                id: { type: graphql_1.GraphQLString },
                                name: { type: graphql_1.GraphQLString },
                                email: { type: graphql_1.GraphQLString }
                            }
                        }) }
                }
            }),
            resolve: resolvers_1.AuthResolver.Query.me
        }
    },
    mutations: {
        register: {
            type: types_1.AuthResponseType,
            args: {
                input: { type: new graphql_1.GraphQLNonNull(types_1.UserInputType) }
            },
            resolve: resolvers_1.AuthResolver.Mutation.register
        },
        login: {
            type: types_1.AuthResponseType,
            args: {
                input: { type: new graphql_1.GraphQLNonNull(types_1.LoginInputType) }
            },
            resolve: resolvers_1.AuthResolver.Mutation.login
        }
    }
};
