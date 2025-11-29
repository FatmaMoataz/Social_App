export { UserGQLSchema } from '../user/user.schema.gql';
export { UserArgs, GraphQLGenderEnum } from '../user/user.args.gql';

export type { AllUsersArgs, SearchUserArgs, AddFollowerArgs } from '../user/user.args.gql';

export { RootGraphQLSchema } from './schema.gql';

// Default schema instance
import { RootGraphQLSchema } from './schema.gql';
const schemaFactory = new RootGraphQLSchema();
export const schema = schemaFactory.createSchema();

// For backward compatibility
import { UserGQLSchema } from '../user/user.schema.gql';
export const userSchema = new UserGQLSchema().getSchema();