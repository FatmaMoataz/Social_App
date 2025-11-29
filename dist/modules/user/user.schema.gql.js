"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserGQLSchema = void 0;
const graphql_1 = require("graphql");
const app_controller_1 = require("../../app.controller");
const user_args_gql_1 = require("./user.args.gql");
const user_resolver_1 = require("./user.resolver");
class UserGQLSchema {
    // Method to get query fields for composition
    getQueryFields() {
        return {
            sayHi: {
                type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
                resolve: () => 'Hi GraphQL'
            },
            checkBoolean: {
                type: graphql_1.GraphQLBoolean,
                resolve: () => true
            },
            allUsers: {
                type: new graphql_1.GraphQLList(new graphql_1.GraphQLNonNull(app_controller_1.GraphQLOneUserResponse)),
                args: user_args_gql_1.UserArgs.allUsers,
                resolve: user_resolver_1.userResolvers.Query.allUsers
            },
            searchUser: {
                type: (0, app_controller_1.GraphQLUniformResponse)({
                    name: "SearchUser",
                    data: app_controller_1.GraphQLOneUserResponse
                }),
                args: user_args_gql_1.UserArgs.searchUser,
                resolve: user_resolver_1.userResolvers.Query.searchUser
            },
            getAllUsers: {
                type: new graphql_1.GraphQLList(new graphql_1.GraphQLNonNull(app_controller_1.GraphQLOneUserResponse)),
                resolve: user_resolver_1.userResolvers.Query.getAllUsers
            },
            getUserById: {
                type: app_controller_1.GraphQLOneUserResponse,
                args: user_args_gql_1.UserArgs.getUserById,
                resolve: user_resolver_1.userResolvers.Query.getUserById
            }
        };
    }
    // Method to get mutation fields for composition
    getMutationFields() {
        return {
            addFollower: {
                type: new graphql_1.GraphQLList(app_controller_1.GraphQLOneUserResponse),
                args: user_args_gql_1.UserArgs.addFollower,
                resolve: user_resolver_1.userResolvers.Mutation.addFollower
            },
            createUser: {
                type: app_controller_1.GraphQLOneUserResponse,
                args: user_args_gql_1.UserArgs.createUser,
                resolve: user_resolver_1.userResolvers.Mutation.createUser
            },
            // updateUser: {
            //   type: GraphQLOneUserResponse,
            //   args: UserArgs.updateUser,
            //   resolve: userResolvers.Mutation.updateUser
            // },
            deleteUser: {
                type: graphql_1.GraphQLBoolean,
                args: user_args_gql_1.UserArgs.deleteUser,
                resolve: user_resolver_1.userResolvers.Mutation.deleteUser
            }
        };
    }
    getSchema() {
        return new graphql_1.GraphQLSchema({
            query: new graphql_1.GraphQLObjectType({
                name: "UserQuery",
                description: "User Queries",
                fields: this.getQueryFields()
            }),
            mutation: new graphql_1.GraphQLObjectType({
                name: "UserMutation",
                description: "User Mutations",
                fields: this.getMutationFields()
            })
        });
    }
}
exports.UserGQLSchema = UserGQLSchema;
