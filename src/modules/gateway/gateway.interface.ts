import { Socket } from "socket.io"
import { HUserDocument } from "../../DB/models"
import { JwtPayload } from "jsonwebtoken"
import { Server } from "socket.io";

export interface IMainDto {
    socket:IAuthSocket;
    callback?:any;
    io?:Server;
}

export interface IAuthSocket extends Socket {
  credentials?: {
    user: Partial<HUserDocument> & { _id?: string },
    decoded: JwtPayload
  }
}