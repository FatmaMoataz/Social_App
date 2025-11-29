import { GraphQLNonNull, GraphQLString, GraphQLInt, GraphQLEnumType } from "graphql";
import { GenderEnum } from "../../DB/models";

export const GraphQLGenderEnum = new GraphQLEnumType({
  name: "GraphQLGenderEnum",
  values: {
    male: { value: GenderEnum.male },
    female: { value: GenderEnum.female },
  }
});

export const UserArgs = {
  allUsers: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    gender: { type: GraphQLGenderEnum }
  },
  searchUser: {
    email: { 
      type: new GraphQLNonNull(GraphQLString), 
      description: "this email used to find unique account" 
    }
  },
  addFollower: {
    friendId: { type: new GraphQLNonNull(GraphQLInt) },
    myId: { type: new GraphQLNonNull(GraphQLInt) }
  }
};

export interface AllUsersArgs {
  name: string;
  gender?: GenderEnum;
}

export interface SearchUserArgs {
  email: string;
}

export interface AddFollowerArgs {
  friendId: number;
  myId: number;
}