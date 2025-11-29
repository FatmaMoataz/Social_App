import { GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLList, GraphQLID, GraphQLInt, GraphQLInputObjectType, GraphQLBoolean } from "graphql";
import { GenderEnum } from "../../../DB/models";

export interface IUser {
  id: number;
  name: string;
  email: string;
  gender: GenderEnum;
  password: string;
  followers: number[];
  role?: string;
  createdAt: Date;
}

export const UserType = new GraphQLObjectType({
  name: "User",
  fields: {
    id: { type: GraphQLID },
    name: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLString },
    gender: { type: GraphQLString },
    followers: { type: new GraphQLList(GraphQLID) },
    role: { type: GraphQLString },
    createdAt: { type: GraphQLString }
  }
});

export const UserListType = new GraphQLObjectType({
  name: "UserList",
  fields: {
    users: { type: new GraphQLList(UserType) },
    total: { type: GraphQLInt }
  }
});

export const UserInputType = new GraphQLInputObjectType({
  name: "UserInput",
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
    gender: { type: new GraphQLNonNull(GraphQLString) }
  }
});

export const LoginInputType = new GraphQLInputObjectType({
  name: "LoginInput",
  fields: {
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) }
  }
});

export const AuthResponseType = new GraphQLObjectType({
  name: "AuthResponse",
  fields: {
    success: { type: GraphQLBoolean },
    message: { type: GraphQLString },
    token: { type: GraphQLString },
    refreshToken: { type: GraphQLString },
    user: { type: UserType },
    statusCode: { type: GraphQLInt }
  }
});