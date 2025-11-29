import { GraphQLNonNull, GraphQLInt, GraphQLID } from "graphql";
import { UserType, UserListType, ResponseMessageType } from "../types";
import { UserResolver } from "../resolvers";

export const UserSchema = {
  queries: {
    users: {
      type: UserListType,
      args: {
        page: { type: GraphQLInt, defaultValue: 1 },
        limit: { type: GraphQLInt, defaultValue: 10 }
      },
      resolve: UserResolver.Query.users
    },
    user: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: UserResolver.Query.user
    }
  },

  mutations: {
    followUser: {
      type: ResponseMessageType,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: UserResolver.Mutation.followUser
    }
  }
};