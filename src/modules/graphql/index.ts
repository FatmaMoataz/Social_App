export { UserGQLSchema } from '../user/user.schema.gql';
export { UserArgs, GraphQLGenderEnum } from '../user/user.args.gql';
export { userResolvers } from '../user/user.resolver';

export type { 
  AllUsersArgs, 
  SearchUserArgs, 
  AddFollowerArgs,
  CreateUserArgs,
  UpdateUserArgs,
  DeleteUserArgs 
} from '../user/user.args.gql';
export type { IUserGQL } from '../user/user.type';

// Export root schema
export { RootGraphQLSchema } from './schema.gql';

// Default schema instance
import { RootGraphQLSchema } from './schema.gql';
const schemaFactory = new RootGraphQLSchema();
export const schema = schemaFactory.createSchema();

// For backward compatibility
import { UserGQLSchema } from '../user/user.schema.gql';
export const userSchema = new UserGQLSchema().getSchema();