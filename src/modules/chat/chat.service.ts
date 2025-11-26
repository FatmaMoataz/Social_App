import type{ Request, Response } from "express";
import { IGetChatParamsDto, ISayHiDto, ISendMessageDto } from "./chat.dto";
import { successResponse } from "../utils/response/success.response";
import { ChatRepository, UserRepository } from "../../DB/repository";
import { ChatModel, UserModel } from "../../DB/models";
import { Types } from "mongoose";
import { BadRequest, Notfound } from "../utils/response/error.response";
import { IGetChatResponse } from "./chat.entity";
import { connectedSockets } from "../gateway";

export class ChatService {
    private userModel:UserRepository = new UserRepository(UserModel)
    private chatModel:ChatRepository = new ChatRepository(ChatModel)
    constructor() {}

//REST API
getChat = async(req:Request , res:Response):Promise<Response> => {
    const {userId} = req.params as IGetChatParamsDto;
    
    const meRaw = req.user?._id;
    const meIdStr = String(meRaw ?? "");
    if (!Types.ObjectId.isValid(meIdStr) || !Types.ObjectId.isValid(userId)) {
        throw new BadRequest("Invalid user id");
    }
    const meId = new Types.ObjectId(meIdStr);
    const otherId = new Types.ObjectId(userId);

    const chat = await this.chatModel.findOne({
        filter:{
            participants:{$all:[meId , otherId]},
            group:{$exists: false}
        },
        options:{
            populate:[{path:'participants' , select:'firstName lastName email gender profilePicture'}]
        }
    })
    if(!chat) {
        throw new BadRequest("Failed to find chatting instance")
    }
    return successResponse<IGetChatResponse>({res , data:{chat}})
}

    // IO
    sayHi=({message , socket , callback , io}:ISayHiDto) => {
        try {
            console.log(message);     
            callback ?  callback("Hello BE To FE") : undefined
        } catch (error) {
            return socket.emit("custom_error" , error)
        }
    }

// SEND OVO MESSAGE
    sendMessage=async({content , sendTo , socket , io}:ISendMessageDto) => {
        try {   
            const rawId = socket.credentials?.user._id;
            const idStr = String(rawId ?? "");
            if (!Types.ObjectId.isValid(idStr)) {
                return socket.emit("custom_error", new BadRequest("Invalid sender id"));
            }
            const createdBy = new Types.ObjectId(idStr);

            if (!Types.ObjectId.isValid(sendTo)) {
                return socket.emit("custom_error", new BadRequest("Invalid recipient id"));
            }
            const sendToId = new Types.ObjectId(sendTo);

            const user = await this.userModel.findOne({
                filter: {
                    _id: sendToId,
                    friends:{$in: createdBy}
                }
            })
            if(!user) {
                throw new Notfound("Invalid recipient friend")
            }
            const chat = await this.chatModel.findOneAndUpdate({
                filter:{
                    participants:{$all:[createdBy , sendToId]},
                    group:{$exists: false}
                }, 
                update: {
                    $addToSet:{messages:{content , createdBy}}
                }
            })

            if(!chat) {
                const [newChat] = await this.chatModel.create({
                    data:[{
                        createdBy,
                        messages: [{ content, createdBy }],
                        participants:[
                            createdBy , sendToId
                        ]
                    } as any]
                }) || []
                if(!newChat) {
                    throw new BadRequest("Failed to create this chat")
                }
            }
            io?.to(connectedSockets.get(createdBy.toString()) || []).emit("successMessage" , {content})
} catch (error) {
            return socket.emit("custom_error" , error)
        }
    }
}