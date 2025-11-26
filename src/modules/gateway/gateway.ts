import { Server} from "socket.io";
import { Server as HttpServer } from "node:http";
import { decodeToken, TokenEnum } from "../utils/security/token.security";
import { BadRequest } from "../utils/response/error.response";
import { IAuthSocket } from "./gateway.interface";
import { ChatGateway } from "../chat";

export const connectedSockets = new Map<string , string[]>();
let io: undefined | Server = undefined;
export const initializeIo = (httpServer:HttpServer) => {

   io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.use(async (socket: IAuthSocket, next) => {
    try {
      const { user, decoded } = await decodeToken({
        authorization: socket.handshake?.auth.authorization || "",
        tokenType: TokenEnum.access,
      });

      const userId = String((user as any)?._id ?? (user as any)?.id ?? "");
      if (!userId) {
        throw new BadRequest("Invalid user id in token");
      }

      const userTabs = connectedSockets.get(userId) || [];
      userTabs.push(socket.id);
      connectedSockets.set(userId, userTabs);

      socket.credentials = { user: { ...(user as any), _id: userId }, decoded };
      next();
    } catch (error: any) {
      next(error);
    }
  });

function disconnection (socket: IAuthSocket) {
    return socket.on("disconnect", () => {
      const userId = socket.credentials?.user._id?.toString() as string
     connectedSockets.delete(userId)
     getIo().emit("offline_user" , userId)
    });
}

  // http://localhost:3000/
const chatGateway:ChatGateway = new ChatGateway()
 io.on("connection", (socket: IAuthSocket) => {
  chatGateway.register(socket , getIo())
disconnection(socket)
  });

}

export const getIo = ():Server => {
  if(!io) {
    throw new BadRequest("Fail to stablish server socket Io")
  }
  return io
}