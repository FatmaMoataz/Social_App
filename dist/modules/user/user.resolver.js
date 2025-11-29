"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolverHelpers = exports.userResolvers = void 0;
const graphql_1 = require("graphql");
const models_1 = require("../../DB/models");
let users = [
    {
        id: 1,
        name: "fatma",
        email: "fatmamoataz65@gmail.com",
        gender: models_1.GenderEnum.female,
        password: "12345",
        followers: [],
    },
    {
        id: 2,
        name: "moataz",
        email: "moataz65@gmail.com",
        gender: models_1.GenderEnum.male,
        password: "67890",
        followers: [],
    },
    {
        id: 3,
        name: "mahmoud",
        email: "mahmoud65@gmail.com",
        gender: models_1.GenderEnum.male,
        password: "26839",
        followers: [],
    },
    {
        id: 4,
        name: "mohamed",
        email: "mohamed65@gmail.com",
        gender: models_1.GenderEnum.male,
        password: "35678",
        followers: [],
    },
];
exports.userResolvers = {
    // Query resolvers
    Query: {
        allUsers: (parent, args) => {
            return users.filter((ele) => ele.name === args.name && (!args.gender || ele.gender === args.gender));
        },
        searchUser: (parent, args) => {
            const user = users.find((ele) => ele.email === args.email);
            if (!user) {
                throw new graphql_1.GraphQLError("Failed to find matching result", {
                    extensions: { statusCode: 404 },
                });
            }
            return { message: "Done", statusCode: 200, data: user };
        },
        getAllUsers: () => {
            return users;
        },
        getUserById: (parent, args) => {
            const user = users.find((user) => user.id === args.id);
            return user || null;
        },
    },
    // Mutation resolvers
    Mutation: {
        addFollower: (parent, args) => {
            users = users.map((ele) => {
                if (ele.id === args.friendId && !ele.followers.includes(args.myId)) {
                    ele.followers.push(args.myId);
                }
                return ele;
            });
            return users;
        },
        createUser: (parent, args) => {
            const maxId = users.length > 0 ? Math.max(...users.map((u) => u.id)) : 0;
            const newUser = {
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
        deleteUser: (parent, args) => {
            const initialLength = users.length;
            users = users.filter((user) => user.id !== args.id);
            return users.length < initialLength;
        },
    },
};
// Helper functions for data management
exports.userResolverHelpers = {
    getUsers: () => [...users],
    setUsers: (newUsers) => {
        users = newUsers;
    },
    findUserById: (id) => {
        return users.find((user) => user.id === id);
    },
    findUserByEmail: (email) => {
        return users.find((user) => user.email === email);
    },
};
