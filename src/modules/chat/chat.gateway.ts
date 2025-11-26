import { Server } from "socket.io"
import { IAuthSocket } from "../gateway"
import { ChatEvent } from "./chat.event"

export class ChatGateway {
    private chatEvent:ChatEvent = new ChatEvent()
    constructor() {}
    register = (socket:IAuthSocket , io:Server) => {
this.chatEvent.sayHi(socket , io)
this.chatEvent.sayHi2(socket)
this.chatEvent.sendMessage(socket , io)
    }
}