import { ISayHiDto } from "./chat.dto";

export class ChatService {
    constructor() {}

    sayHi=({message , socket , callback , io}:ISayHiDto) => {
try {
        console.log(message);     
        callback ?  callback("Hello BE To FE") : undefined
} catch (error) {
    return socket.emit("custom_error" , error)
}
    }
}