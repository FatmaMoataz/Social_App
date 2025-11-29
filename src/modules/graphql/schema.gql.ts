import { GraphQLSchema, GraphQLObjectType, GraphQLString } from "graphql";
import { UserGQLSchema } from "../user/user.schema.gql";

export class RootGraphQLSchema {
  private userGQLSchema: UserGQLSchema;

  constructor() {
    this.userGQLSchema = new UserGQLSchema();
  }

  public createSchema(): GraphQLSchema {
    // Get fields from user schema
    const userQueryFields = this.userGQLSchema.getQueryFields();
    const userMutationFields = this.userGQLSchema.getMutationFields();

    // Extend with additional fields
    const extendedQueryFields = {
      ...userQueryFields,
      healthCheck: {
        type: GraphQLString,
        resolve: () => 'Server is healthy'
      }
    };

    const queryType = new GraphQLObjectType({
      name: "RootQuery",
      description: "Root Query",
      fields: extendedQueryFields
    });

    const mutationType = new GraphQLObjectType({
      name: "RootMutation",
      description: "Root Mutation",
      fields: userMutationFields
    });

    return new GraphQLSchema({
      query: queryType,
      mutation: mutationType
    });
  }

  // Simple approach - use user schema directly
  public createSimpleSchema(): GraphQLSchema {
    return this.userGQLSchema.getSchema();
  }
}