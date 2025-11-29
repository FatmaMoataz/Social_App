import { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLBoolean } from "graphql";

export const PaginationInfoType = new GraphQLObjectType({
  name: "PaginationInfo",
  fields: {
    page: { type: GraphQLInt },
    limit: { type: GraphQLInt },
    total: { type: GraphQLInt },
    hasNext: { type: GraphQLBoolean },
    hasPrev: { type: GraphQLBoolean },
    totalPages: { type: GraphQLInt }
  }
});

export const ResponseMessageType = new GraphQLObjectType({
  name: "ResponseMessage",
  fields: {
    success: { type: GraphQLBoolean },
    message: { type: GraphQLString },
    statusCode: { type: GraphQLInt }
  }
});