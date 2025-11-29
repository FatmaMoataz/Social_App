import { GraphQLObjectType, GraphQLNonNull, GraphQLString } from "graphql";
import { AuthResponseType, LoginInputType, UserInputType } from "../types";
import { AuthResolver } from "../resolvers";

export const AuthSchema = {
  queries: {
    me: {
      type: new GraphQLObjectType({
        name: "AuthQuery",
        fields: {
          me: { type: new GraphQLObjectType({
            name: "Me",
            fields: {
              id: { type: GraphQLString },
              name: { type: GraphQLString },
              email: { type: GraphQLString }
            }
          })}
        }
      }),
      resolve: AuthResolver.Query.me
    }
  },

  mutations: {
    register: {
      type: AuthResponseType,
      args: {
        input: { type: new GraphQLNonNull(UserInputType) }
      },
      resolve: AuthResolver.Mutation.register
    },
    login: {
      type: AuthResponseType,
      args: {
        input: { type: new GraphQLNonNull(LoginInputType) }
      },
      resolve: AuthResolver.Mutation.login
    }
  }
};