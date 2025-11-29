import { GraphQLError } from "graphql";
import { IGraphQLContext } from "../context";
import { Authenticated } from "../auth";
import { IUser } from "../types";
import { GenderEnum } from "../../../DB/models";

// Mock data
let users: IUser[] = [
  { 
    id: 1, 
    name: "fatma", 
    email: "fatmamoataz65@gmail.com", 
    gender: GenderEnum.female, 
    password: "hashed", 
    followers: [2, 3],
    role: "user",
    createdAt: new Date()
  },
  { 
    id: 2, 
    name: "moataz", 
    email: "moataz@example.com", 
    gender: GenderEnum.male, 
    password: "hashed", 
    followers: [1],
    role: "user",
    createdAt: new Date()
  }
];

export const UserResolver = {
  Query: {
    users: (_: unknown, { page = 1, limit = 10 }: any, context: IGraphQLContext) => {
      Authenticated(_, 'users', { value: () => {} });

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      const paginatedUsers = users.slice(startIndex, endIndex);
      const usersWithoutPasswords = paginatedUsers.map(({ password, ...user }) => user);

      return {
        users: usersWithoutPasswords,
        total: users.length
      };
    },

    user: (_: unknown, { id }: any, context: IGraphQLContext) => {
      Authenticated(_, 'user', { value: () => {} });

      const user = users.find(u => u.id === parseInt(id));
      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND', statusCode: 404 }
        });
      }

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
  },

  Mutation: {
    followUser: (_: unknown, { userId }: any, context: IGraphQLContext) => {
      Authenticated(_, 'followUser', { value: () => {} });

      const currentUserId = context.user!.userId;
      const userToFollow = users.find(u => u.id === parseInt(userId));

      if (!userToFollow) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND', statusCode: 404 }
        });
      }

      if (userToFollow.id === currentUserId) {
        throw new GraphQLError('Cannot follow yourself', {
          extensions: { code: 'BAD_REQUEST', statusCode: 400 }
        });
      }

      if (!userToFollow.followers.includes(currentUserId)) {
        userToFollow.followers.push(currentUserId);
      }

      return {
        success: true,
        message: 'User followed successfully',
        statusCode: 200
      };
    }
  }
};