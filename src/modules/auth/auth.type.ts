import { GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLBoolean } from "graphql";
import { GraphQLOneUserResponse } from "../user/user.type";

export interface IAuthPayload {
  userId: number;
  email: string;
}

export const AuthResponseType = new GraphQLObjectType({
  name: "AuthResponse",
  fields: {
    success: { type: GraphQLBoolean },
    message: { type: GraphQLString },
    token: { type: GraphQLString },
    user: { type: GraphQLOneUserResponse },
    statusCode: { type: GraphQLString }
  }
});

export const LoginInputType = new GraphQLObjectType({
  name: "LoginInput",
  fields: {
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) }
  }
});

export const RegisterInputType = new GraphQLObjectType({
  name: "RegisterInput",
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
    gender: { type: new GraphQLNonNull(GraphQLString) }
  }
});