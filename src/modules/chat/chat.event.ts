import { Server } from "socket.io"
import { IAuthSocket } from "../gateway"
import { ChatService } from "./chat.service"

 export class ChatEvent {
    private chatService:ChatService = new ChatService()
        constructor() {}
        sayHi = (socket:IAuthSocket , io:Server) => {
return socket.on("sayHi" , (message:string , callback) => {
this.chatService.sayHi({message , socket , callback , io})
    })
        }
        sayHi2 = (socket:IAuthSocket) => {
 return socket.on("sayHi2" , (data , callback) => {
callback("Hello BE To FE")
    })
        }
    }