import { GraphQLSchema, GraphQLObjectType, GraphQLString } from "graphql";
import { AuthSchema } from "./schema/auth.schema";
import { UserSchema } from "./schema/user.schema";
import { PostSchema } from "./schema/post.schema";

export class RootSchema {
  static createSchema(): GraphQLSchema {
    // Combine all query fields
    const queryFields = {
      // Health check
      healthCheck: {
        type: GraphQLString,
        resolve: () => 'GraphQL Server is running!'
      },
      // Auth queries
      ...AuthSchema.queries,
      // User queries
      ...UserSchema.queries,

      ...PostSchema.queries
    };


    const mutationFields = {

      ...AuthSchema.mutations,

      ...UserSchema.mutations,

      ...PostSchema.mutations
    };

    const RootQuery = new GraphQLObjectType({
      name: 'RootQuery',
      fields: queryFields
    });

    const RootMutation = new GraphQLObjectType({
      name: 'RootMutation',
      fields: mutationFields
    });

    return new GraphQLSchema({
      query: RootQuery,
      mutation: RootMutation
    });
  }
}