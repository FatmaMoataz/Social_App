"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseMessageType = exports.PaginationInfoType = void 0;
const graphql_1 = require("graphql");
exports.PaginationInfoType = new graphql_1.GraphQLObjectType({
    name: "PaginationInfo",
    fields: {
        page: { type: graphql_1.GraphQLInt },
        limit: { type: graphql_1.GraphQLInt },
        total: { type: graphql_1.GraphQLInt },
        hasNext: { type: graphql_1.GraphQLBoolean },
        hasPrev: { type: graphql_1.GraphQLBoolean },
        totalPages: { type: graphql_1.GraphQLInt }
    }
});
exports.ResponseMessageType = new graphql_1.GraphQLObjectType({
    name: "ResponseMessage",
    fields: {
        success: { type: graphql_1.GraphQLBoolean },
        message: { type: graphql_1.GraphQLString },
        statusCode: { type: graphql_1.GraphQLInt }
    }
});
