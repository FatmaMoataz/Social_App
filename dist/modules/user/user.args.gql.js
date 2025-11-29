"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserArgs = exports.GraphQLGenderEnum = void 0;
const graphql_1 = require("graphql");
const models_1 = require("../../DB/models");
const user_type_1 = require("./user.type");
exports.GraphQLGenderEnum = new graphql_1.GraphQLEnumType({
    name: "GraphQLGenderEnum",
    values: {
        male: { value: models_1.GenderEnum.male },
        female: { value: models_1.GenderEnum.female },
    }
});
exports.UserArgs = {
    // Query args
    allUsers: {
        name: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        gender: { type: exports.GraphQLGenderEnum }
    },
    searchUser: {
        email: {
            type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
            description: "this email used to find unique account"
        }
    },
    getUserById: {
        id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) }
    },
    // Mutation args
    addFollower: {
        friendId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        myId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) }
    },
    createUser: {
        input: { type: new graphql_1.GraphQLNonNull(user_type_1.UserInputType) }
    },
    updateUser: {
        id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
        name: { type: graphql_1.GraphQLString },
        email: { type: graphql_1.GraphQLString },
        gender: { type: exports.GraphQLGenderEnum }
    },
    deleteUser: {
        id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) }
    }
};
