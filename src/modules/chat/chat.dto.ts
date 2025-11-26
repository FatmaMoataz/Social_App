import { Server } from "socket.io";
import { IAuthSocket } from "../gateway";

export interface IMainDto {
    socket:IAuthSocket;
    callback?:any;
    io?:Server;
}

export interface ISayHiDto extends IMainDto{
    message:string;
}