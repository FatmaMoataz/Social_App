"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInputType = exports.GraphQLOneUserResponse = void 0;
const graphql_1 = require("graphql");
const user_args_gql_1 = require("./user.args.gql");
exports.GraphQLOneUserResponse = new graphql_1.GraphQLObjectType({
    name: "OneUserResponse",
    fields: {
        id: { type: graphql_1.GraphQLID },
        name: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString), description: "userName" },
        email: { type: graphql_1.GraphQLString },
        gender: { type: user_args_gql_1.GraphQLGenderEnum },
        followers: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) }
    }
});
// Input type for creating users (GraphQLInputObjectType for mutations)
exports.UserInputType = new graphql_1.GraphQLInputObjectType({
    name: "UserInput",
    fields: {
        name: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        email: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        gender: { type: new graphql_1.GraphQLNonNull(user_args_gql_1.GraphQLGenderEnum) },
        password: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) }
    }
});
