"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RootSchema = void 0;
const graphql_1 = require("graphql");
const auth_schema_1 = require("./schema/auth.schema");
const user_schema_1 = require("./schema/user.schema");
const post_schema_1 = require("./schema/post.schema");
class RootSchema {
    static createSchema() {
        // Combine all query fields
        const queryFields = {
            // Health check
            healthCheck: {
                type: graphql_1.GraphQLString,
                resolve: () => 'GraphQL Server is running!'
            },
            // Auth queries
            ...auth_schema_1.AuthSchema.queries,
            // User queries
            ...user_schema_1.UserSchema.queries,
            ...post_schema_1.PostSchema.queries
        };
        const mutationFields = {
            ...auth_schema_1.AuthSchema.mutations,
            ...user_schema_1.UserSchema.mutations,
            ...post_schema_1.PostSchema.mutations
        };
        const RootQuery = new graphql_1.GraphQLObjectType({
            name: 'RootQuery',
            fields: queryFields
        });
        const RootMutation = new graphql_1.GraphQLObjectType({
            name: 'RootMutation',
            fields: mutationFields
        });
        return new graphql_1.GraphQLSchema({
            query: RootQuery,
            mutation: RootMutation
        });
    }
}
exports.RootSchema = RootSchema;
