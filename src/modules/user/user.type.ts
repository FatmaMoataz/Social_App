import { GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLList, GraphQLID, GraphQLInputObjectType } from "graphql";
import { GraphQLGenderEnum } from "./user.args.gql";
import { GenderEnum } from "../../DB/models";

export interface IUserGQL {
  id: number;
  name: string;
  email: string;
  gender: GenderEnum;
  password: string;
  followers: number[];
}

export const GraphQLOneUserResponse = new GraphQLObjectType({
  name: "OneUserResponse",
  fields: {
    id: { type: GraphQLID },
    name: { type: new GraphQLNonNull(GraphQLString), description: "userName" },
    email: { type: GraphQLString },
    gender: { type: GraphQLGenderEnum },
    followers: { type: new GraphQLList(GraphQLID) }
  }
});

// Input type for creating users (GraphQLInputObjectType for mutations)
export const UserInputType = new GraphQLInputObjectType({
  name: "UserInput",
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    gender: { type: new GraphQLNonNull(GraphQLGenderEnum) },
    password: { type: new GraphQLNonNull(GraphQLString) }
  }
});