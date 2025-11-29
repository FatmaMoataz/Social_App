import { GraphQLSchema, GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLBoolean, GraphQLList, GraphQLError} from "graphql";
import { GraphQLOneUserResponse, GraphQLUniformResponse, IUser } from "../../app.controller";
import { GenderEnum } from "../../DB/models";
import { UserArgs, AllUsersArgs, SearchUserArgs, AddFollowerArgs } from "./user.args.gql";

export class UserGQLSchema {
  private users: IUser[] = [
    {id:1 , name:"fatma" , email:"fatmamoataz65@gmail.com" , gender:GenderEnum.female , password:"12345" , followers:[]},
    {id:2 , name:"moataz" , email:"moataz65@gmail.com" , gender:GenderEnum.male , password:"67890" , followers:[]},
    {id:3 , name:"mahmoud" , email:"mahmoud65@gmail.com" , gender:GenderEnum.male , password:"26839" , followers:[]},
    {id:4 , name:"mohamed" , email:"mohamed65@gmail.com" , gender:GenderEnum.male , password:"35678" , followers:[]},
  ];

  public getQueryFields() {
    return {
      sayHi: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: (parent: unknown, args: any) => {
          return 'Hi GraphQL';
        }
      },
      checkBoolean: {
        type: GraphQLBoolean,
        resolve: (parent: unknown, args: any) => {
          return true;
        }
      },
      allUsers: {
        type: new GraphQLList(new GraphQLNonNull(GraphQLOneUserResponse)),
        args: UserArgs.allUsers,
        resolve: (parent: unknown, args: AllUsersArgs) => {
          return this.users.filter(ele => ele.name === args.name && ele.gender === args.gender);
        }
      },
      searchUser: {
        type: GraphQLUniformResponse({
          name: "SearchUser",
          data: GraphQLOneUserResponse
        }),
        args: UserArgs.searchUser,
        resolve: (parent: unknown, args: SearchUserArgs) => {
          const user = this.users.find(ele => ele.email === args.email);
          if (!user) {
            throw new GraphQLError("Failed to find matching result", { extensions: { statusCode: 404 } });
          }
          return { message: "Done", statusCode: 200, data: user };
        }
      }
    };
  }

  public getMutationFields() {
    return {
      addFollower: {
        type: new GraphQLList(GraphQLOneUserResponse),
        args: UserArgs.addFollower,
        resolve: (parent: unknown, args: AddFollowerArgs) => {
          this.users = this.users.map((ele: IUser): IUser => {
            if (ele.id === args.friendId) {
              ele.followers.push(args.myId);
            }
            return ele;
          });
          return this.users;
        }
      }
    };
  }

  public getSchema(): GraphQLSchema {
    return new GraphQLSchema({
      query: new GraphQLObjectType({
        name: "RootQueryName",
        description: "optional text",
        fields: this.getQueryFields()
      }),
      mutation: new GraphQLObjectType({
        name: "RootSchemaMutation",
        description: "hold all RootSchemaMutation fields",
        fields: this.getMutationFields()
      })
    });
  }
}