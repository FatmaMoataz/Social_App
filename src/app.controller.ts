import { resolve } from "node:path";
import { config } from "dotenv";
config({ path: resolve("./config/.env.development") });

import type { Express, Request, Response } from "express";
import express from "express";

import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

import { authRouter, userRouter, postRouter, initializeIo, chatRouter } from "./modules";

import {
  BadRequest,
  globalErrorHandling,
} from "./modules/utils/response/error.response";

import connectDB from "./DB/connection.db.js";
import {
  createGetPreSignedLink,
  getFile,
} from "./modules/utils/multer/s3.config";

import { promisify } from "node:util";
import { pipeline } from "node:stream";

const createS3WriteStreamPipe = promisify(pipeline);

import { GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLOutputType, GraphQLString} from 'graphql'
import {createHandler} from 'graphql-http/lib/use/express'
import { GenderEnum } from "./DB/models";
import { UserGQLSchema } from "./modules/user/user.schema.gql";

const limiter = rateLimit({
  windowMs: 60 * 6000,
  limit: 2000,
  message: { error: "Too many request please try again later" },
});

export const GraphQLUniformResponse = ({name , data}:{name:string , data:GraphQLOutputType}):GraphQLOutputType => {
  return new GraphQLObjectType({
    name: name,
    fields: {
      message: { type: GraphQLString },
      statusCode: { type: GraphQLInt },
      data: { type: data }
    },
  });
}

export const GraphQLGenderEnum = new GraphQLEnumType({
  name: "GraphQLGenderEnum",
  values: {
    male: { value: GenderEnum.male },
    female: { value: GenderEnum.female },
  }
});

export const GraphQLOneUserResponse = new GraphQLObjectType({
  name: "oneUserResponse",
  fields: {
    id: { type: GraphQLID },
    name: { type: new GraphQLNonNull(GraphQLString), description: "userName" },
    email: { type: GraphQLString },
    gender: { type: GraphQLGenderEnum },
    followers: { type: new GraphQLList(GraphQLID) }
  }
});

export interface IUser {
  id: number,
  name: string,
  email: string,
  gender: GenderEnum,
  password: string,
  followers: number[]
}

const bootstrap = async (): Promise<void> => {
  const app: Express = express();
  const port: number | string = process.env.PORT || 5000;
  app.use(cors(), express.json(), helmet());

  // Create instance of UserGQLSchema and get the schema
  const userGQLSchema = new UserGQLSchema();
  const schema = userGQLSchema.getSchema();

  // Use the schema with GraphQL HTTP handler
  app.all("/graphql", createHandler({ schema }));

  app.use(limiter);
  await connectDB();

  app.get("/sayHi", (req: Request, res: Response) => {
    return res.json({ message: "Done" });
  });

  // app-routing
  app.get("/", (req: Request, res: Response) => {
    res.json({
      message: `Welcome to ${process.env.APPLICATION_NAME} backend landing page`,
    });
  });

  // modules
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/post", postRouter);
  app.use("/chat", chatRouter);

  app.use(globalErrorHandling);

  app.get(
    "/uploads/*path",
    async (req: Request, res: Response): Promise<void> => {
      const { downloadName, download = "false" } = req.query as {
        downloadName?: string;
        download?: string;
      };
      const { path } = req.params as unknown as { path: string[] };
      const Key = path.join("/");
      const s3Response = await getFile({ Key });
      if (!s3Response?.Body) {
        throw new BadRequest("Failed to fetch this asset");
      }
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader(
        "Content-type",
        `${s3Response.ContentType || "application/octet-stream"}`
      );
      if (download === "true") {
        res.setHeader(
          "Content-Disposition",
          `attachments: filename="${downloadName || Key.split("/").pop()}"`
        );
      }
      return await createS3WriteStreamPipe(
        s3Response.Body as NodeJS.ReadableStream,
        res
      );
    }
  );

  app.get(
    "/uploads/pre-signed/*path",
    async (req: Request, res: Response): Promise<Response> => {
      const {
        downloadName,
        download = "false",
        expiresIn = 120,
      } = req.query as {
        downloadName?: string;
        download?: string;
        expiresIn?: number;
      };
      const { path } = req.params as unknown as { path: string[] };
      const Key = path.join("/");
      const url = await createGetPreSignedLink({
        Key,
        download,
        downloadName: downloadName as string,
        expiresIn,
      });
      return res.json({ message: "Done", data: { url } });
    }
  );

  // invalid route
  app.use("{/*dummy}", (req: Request, res: Response) => {
    return res.status(404).json({ message: "Invalid routing" });
  });

  const httpServer = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  
  initializeIo(httpServer);
};

export default bootstrap;