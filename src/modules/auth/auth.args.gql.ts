import { GraphQLNonNull, GraphQLString } from "graphql";
import { LoginInputType, RegisterInputType } from "./auth.type";

export const AuthArgs = {
  login: {
    input: { type: new GraphQLNonNull(LoginInputType) }
  },
  register: {
    input: { type: new GraphQLNonNull(RegisterInputType) }
  },
  logout: {
    token: { type: new GraphQLNonNull(GraphQLString) }
  },
  refreshToken: {
    token: { type: new GraphQLNonNull(GraphQLString) }
  }
};

// Types for TypeScript
export interface LoginArgs {
  input: {
    email: string;
    password: string;
  };
}

export interface RegisterArgs {
  input: {
    name: string;
    email: string;
    password: string;
    gender: string;
  };
}

export interface LogoutArgs {
  token: string;
}

export interface RefreshTokenArgs {
  token: string;
}