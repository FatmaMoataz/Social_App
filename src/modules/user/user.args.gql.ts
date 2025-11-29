import { GraphQLNonNull, GraphQLString, GraphQLInt, GraphQLEnumType } from "graphql";
import { GenderEnum } from "../../DB/models";
import { UserInputType } from "./user.type";

export const GraphQLGenderEnum = new GraphQLEnumType({
  name: "GraphQLGenderEnum",
  values: {
    male: { value: GenderEnum.male },
    female: { value: GenderEnum.female },
  }
});

export const UserArgs = {
  // Query args
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
  getUserById: {
    id: { type: new GraphQLNonNull(GraphQLInt) }
  },
  
  // Mutation args
  addFollower: {
    friendId: { type: new GraphQLNonNull(GraphQLInt) },
    myId: { type: new GraphQLNonNull(GraphQLInt) }
  },
  createUser: {
    input: { type: new GraphQLNonNull(UserInputType) }
  },
  updateUser: {
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    gender: { type: GraphQLGenderEnum }
  },
  deleteUser: {
    id: { type: new GraphQLNonNull(GraphQLInt) }
  }
};

// Types for TypeScript
export interface AllUsersArgs {
  name: string;
  gender?: GenderEnum;
}

export interface SearchUserArgs {
  email: string;
}

export interface GetUserByIdArgs {
  id: number;
}

export interface AddFollowerArgs {
  friendId: number;
  myId: number;
}

export interface CreateUserArgs {
  input: {
    name: string;
    email: string;
    gender: GenderEnum;
    password: string;
  };
}

export interface UpdateUserArgs {
  id: number;
  name?: string;
  email?: string;
  gender?: GenderEnum;
}

export interface DeleteUserArgs {
  id: number;
}