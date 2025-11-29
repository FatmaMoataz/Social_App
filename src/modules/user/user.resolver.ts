import { GraphQLError } from "graphql";
import { IUserGQL } from "./user.type";
import { GenderEnum } from "../../DB/models";
import {
  AllUsersArgs,
  SearchUserArgs,
  AddFollowerArgs,
  CreateUserArgs,
//   UpdateUserArgs,
  DeleteUserArgs,
} from "./user.args.gql";

let users: IUserGQL[] = [
  {
    id: 1,
    name: "fatma",
    email: "fatmamoataz65@gmail.com",
    gender: GenderEnum.female,
    password: "12345",
    followers: [],
  },
  {
    id: 2,
    name: "moataz",
    email: "moataz65@gmail.com",
    gender: GenderEnum.male,
    password: "67890",
    followers: [],
  },
  {
    id: 3,
    name: "mahmoud",
    email: "mahmoud65@gmail.com",
    gender: GenderEnum.male,
    password: "26839",
    followers: [],
  },
  {
    id: 4,
    name: "mohamed",
    email: "mohamed65@gmail.com",
    gender: GenderEnum.male,
    password: "35678",
    followers: [],
  },
];

export const userResolvers = {
  // Query resolvers
  Query: {
    allUsers: (parent: unknown, args: AllUsersArgs): IUserGQL[] => {
      return users.filter(
        (ele) =>
          ele.name === args.name && (!args.gender || ele.gender === args.gender)
      );
    },

    searchUser: (parent: unknown, args: SearchUserArgs) => {
      const user = users.find((ele) => ele.email === args.email);
      if (!user) {
        throw new GraphQLError("Failed to find matching result", {
          extensions: { statusCode: 404 },
        });
      }
      return { message: "Done", statusCode: 200, data: user };
    },

    getAllUsers: (): IUserGQL[] => {
      return users;
    },

    getUserById: (parent: unknown, args: { id: number }): IUserGQL | null => {
      const user = users.find((user) => user.id === args.id);
      return user || null;
    },
  },

  // Mutation resolvers
  Mutation: {
    addFollower: (parent: unknown, args: AddFollowerArgs): IUserGQL[] => {
      users = users.map((ele: IUserGQL): IUserGQL => {
        if (ele.id === args.friendId && !ele.followers.includes(args.myId)) {
          ele.followers.push(args.myId);
        }
        return ele;
      });
      return users;
    },

    createUser: (parent: unknown, args: CreateUserArgs): IUserGQL => {

      const maxId = users.length > 0 ? Math.max(...users.map((u) => u.id)) : 0;

      const newUser: IUserGQL = {
        id: maxId + 1,
        name: args.input.name,
        email: args.input.email,
        gender: args.input.gender,
        password: args.input.password,
        followers: [],
      };
      users.push(newUser);
      return newUser;
    },

    // updateUser: (parent: unknown, args: UpdateUserArgs): IUserGQL => {
    //   let userIndex = users.findIndex((user) => user.id === args.id);
    //   if (userIndex === -1) {
    //     throw new GraphQLError("User not found", {
    //       extensions: { statusCode: 404 },
    //     });
    //   }

    //   if (args.name) users[userIndex].name = args.name;
    //   if (args.email) users[userIndex].email = args.email;
    //   if (args.gender) users[userIndex].gender = args.gender;

    //   return users[userIndex];
    // },

    deleteUser: (parent: unknown, args: DeleteUserArgs): boolean => {
      const initialLength = users.length;
      users = users.filter((user) => user.id !== args.id);
      return users.length < initialLength;
    },
  },
};

// Helper functions for data management
export const userResolverHelpers = {
  getUsers: (): IUserGQL[] => [...users],

  setUsers: (newUsers: IUserGQL[]): void => {
    users = newUsers;
  },

  findUserById: (id: number): IUserGQL | undefined => {
    return users.find((user) => user.id === id);
  },

  findUserByEmail: (email: string): IUserGQL | undefined => {
    return users.find((user) => user.email === email);
  },
};
