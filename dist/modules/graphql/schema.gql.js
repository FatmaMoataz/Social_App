"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RootGraphQLSchema = void 0;
const graphql_1 = require("graphql");
const user_schema_gql_1 = require("../user/user.schema.gql");
class RootGraphQLSchema {
    userGQLSchema;
    constructor() {
        this.userGQLSchema = new user_schema_gql_1.UserGQLSchema();
    }
    createSchema() {
        // Get fields from user schema
        const userQueryFields = this.userGQLSchema.getQueryFields();
        const userMutationFields = this.userGQLSchema.getMutationFields();
        // Extend with additional fields
        const extendedQueryFields = {
            ...userQueryFields,
            healthCheck: {
                type: graphql_1.GraphQLString,
                resolve: () => 'Server is healthy'
            }
        };
        const queryType = new graphql_1.GraphQLObjectType({
            name: "RootQuery",
            description: "Root Query",
            fields: extendedQueryFields
        });
        const mutationType = new graphql_1.GraphQLObjectType({
            name: "RootMutation",
            description: "Root Mutation",
            fields: userMutationFields
        });
        return new graphql_1.GraphQLSchema({
            query: queryType,
            mutation: mutationType
        });
    }
    // Simple approach - use user schema directly
    createSimpleSchema() {
        return this.userGQLSchema.getSchema();
    }
}
exports.RootGraphQLSchema = RootGraphQLSchema;
