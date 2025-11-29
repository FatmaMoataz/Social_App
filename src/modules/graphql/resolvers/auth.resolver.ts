import { GraphQLError } from "graphql";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IGraphQLContext } from "../context";
import { UserValidation } from "../validation";
import { IUser } from "../types";
import { Authenticated } from "../auth";
import { GenderEnum } from "../../../DB/models";

let users: IUser[] = [
  { 
    id: 1, 
    name: "fatma", 
    email: "fatmamoataz65@gmail.com", 
    gender: GenderEnum.female, 
    password: "$2b$12$hashedpassword", 
    followers: [],
    role: "user",
    createdAt: new Date()
  }
];

export const AuthResolver = {
  Query: {
    me: (_: unknown, __: unknown, context: IGraphQLContext) => {
      Authenticated(_, 'me', { value: () => {} }); // Apply auth decorator
      
      const user = users.find(u => u.id === context.user?.userId);
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
    register: async (_: unknown, { input }: any) => {
      try {
        // Validation
        UserValidation.validateEmail(input.email);
        UserValidation.validatePassword(input.password);
        UserValidation.validateName(input.name);

        // Check if user exists
        const existingUser = users.find(u => u.email === input.email);
        if (existingUser) {
          throw new GraphQLError('User already exists', {
            extensions: { code: 'CONFLICT', statusCode: 409 }
          });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(input.password, parseInt(process.env.SALT || '12'));

        // Create user
        const newUser: IUser = {
          id: users.length + 1,
          name: input.name,
          email: input.email,
          gender: input.gender,
          password: hashedPassword,
          followers: [],
          role: 'user',
          createdAt: new Date()
        };

        users.push(newUser);

        // Generate tokens
        const tokenPayload = { userId: newUser.id, email: newUser.email, role: newUser.role };
        const token = jwt.sign(tokenPayload, process.env.ACCESS_USER_TOKEN_SIGNATURE!, { 
          expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN || '3600')
        });
        const refreshToken = jwt.sign(tokenPayload, process.env.REFRESH_USER_TOKEN_SIGNATURE!, {
          expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN || '315366000')
        });

        const { password, ...userWithoutPassword } = newUser;

        return {
          success: true,
          message: 'Registration successful',
          token,
          refreshToken,
          user: userWithoutPassword,
          statusCode: 201
        };
      } catch (error) {
        throw error;
      }
    },

    login: async (_: unknown, { input }: any) => {
      try {
        UserValidation.validateEmail(input.email);

        const user = users.find(u => u.email === input.email);
        if (!user) {
          throw new GraphQLError('Invalid credentials', {
            extensions: { code: 'UNAUTHENTICATED', statusCode: 401 }
          });
        }

        const isPasswordValid = await bcrypt.compare(input.password, user.password);
        if (!isPasswordValid) {
          throw new GraphQLError('Invalid credentials', {
            extensions: { code: 'UNAUTHENTICATED', statusCode: 401 }
          });
        }

        const tokenPayload = { userId: user.id, email: user.email, role: user.role };
        const token = jwt.sign(tokenPayload, process.env.ACCESS_USER_TOKEN_SIGNATURE!, { 
          expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN || '3600')
        });
        const refreshToken = jwt.sign(tokenPayload, process.env.REFRESH_USER_TOKEN_SIGNATURE!, {
          expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN || '315366000')
        });

        const { password, ...userWithoutPassword } = user;

        return {
          success: true,
          message: 'Login successful',
          token,
          refreshToken,
          user: userWithoutPassword,
          statusCode: 200
        };
      } catch (error) {
        throw error;
      }
    }
  }
};