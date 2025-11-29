import { GraphQLSchema, GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLBoolean, GraphQLList } from "graphql";
import { GraphQLOneUserResponse, GraphQLUniformResponse } from "../../app.controller";
import { UserArgs } from "./user.args.gql";
import { userResolvers } from "./user.resolver";

export class UserGQLSchema {
  // Method to get query fields for composition
  public getQueryFields() {
    return {
      sayHi: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: () => 'Hi GraphQL'
      },
      checkBoolean: {
        type: GraphQLBoolean,
        resolve: () => true
      },
      allUsers: {
        type: new GraphQLList(new GraphQLNonNull(GraphQLOneUserResponse)),
        args: UserArgs.allUsers,
        resolve: userResolvers.Query.allUsers
      },
      searchUser: {
        type: GraphQLUniformResponse({
          name: "SearchUser",
          data: GraphQLOneUserResponse
        }),
        args: UserArgs.searchUser,
        resolve: userResolvers.Query.searchUser
      },
      getAllUsers: {
        type: new GraphQLList(new GraphQLNonNull(GraphQLOneUserResponse)),
        resolve: userResolvers.Query.getAllUsers
      },
      getUserById: {
        type: GraphQLOneUserResponse,
        args: UserArgs.getUserById,
        resolve: userResolvers.Query.getUserById
      }
    };
  }

  // Method to get mutation fields for composition
  public getMutationFields() {
    return {
      addFollower: {
        type: new GraphQLList(GraphQLOneUserResponse),
        args: UserArgs.addFollower,
        resolve: userResolvers.Mutation.addFollower
      },
      createUser: {
        type: GraphQLOneUserResponse,
        args: UserArgs.createUser,
        resolve: userResolvers.Mutation.createUser
      },
      // updateUser: {
      //   type: GraphQLOneUserResponse,
      //   args: UserArgs.updateUser,
      //   resolve: userResolvers.Mutation.updateUser
      // },
      deleteUser: {
        type: GraphQLBoolean,
        args: UserArgs.deleteUser,
        resolve: userResolvers.Mutation.deleteUser
      }
    };
  }

  public getSchema(): GraphQLSchema {
    return new GraphQLSchema({
      query: new GraphQLObjectType({
        name: "UserQuery",
        description: "User Queries",
        fields: this.getQueryFields()
      }),
      mutation: new GraphQLObjectType({
        name: "UserMutation", 
        description: "User Mutations",
        fields: this.getMutationFields()
      })
    });
  }
}