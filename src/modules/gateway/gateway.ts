import { Server} from "socket.io";
import { Server as HttpServer } from "node:http";
import { decodeToken, TokenEnum } from "../utils/security/token.security";
import { BadRequest } from "../utils/response/error.response";
import { IAuthSocket } from "./gateway.interface";

const connectedSockets = new Map<string , string[]>();

export const initializeIo = (httpServer:HttpServer) => {

     const io = new Server(httpServer, {
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
     io.emit("offline_user" , userId)
    });
}

  // http://localhost:3000/
  io.on("connection", (socket: IAuthSocket) => {

    socket.on("sayHi" , (data , callback) => {
callback("Hello BE To FE")
    })
disconnection(socket)
  });

}