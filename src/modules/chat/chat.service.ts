import type{ Request, Response } from "express";
import { ICreateChattingGroupParamsDto, IGetChatParamsDto, IGetChatQueryParamsDto, ISayHiDto, ISendMessageDto } from "./chat.dto";
import { successResponse } from "../utils/response/success.response";
import { ChatRepository, UserRepository } from "../../DB/repository";
import { ChatModel, UserModel } from "../../DB/models";
import { Types } from "mongoose";
import { BadRequest, Notfound } from "../utils/response/error.response";
import { IGetChatResponse } from "./chat.entity";
import { connectedSockets } from "../gateway";
import { deleteFile, uploadFile } from "../utils/multer/s3.config";
import {v4 as uuid} from 'uuid'

export class ChatService {
    private userModel:UserRepository = new UserRepository(UserModel)
    private chatModel:ChatRepository = new ChatRepository(ChatModel)
    constructor() {}

//REST API
getChat = async(req:Request , res:Response):Promise<Response> => {

    const {userId} = req.params as IGetChatParamsDto;
    const {page , size}:IGetChatQueryParamsDto = req.query;
    
    const meRaw = req.user?._id;
    const meIdStr = String(meRaw ?? "");
    if (!Types.ObjectId.isValid(meIdStr) || !Types.ObjectId.isValid(userId)) {
        throw new BadRequest("Invalid user id");
    }
    const meId = new Types.ObjectId(meIdStr);
    const otherId = new Types.ObjectId(userId);

    const chat = await this.chatModel.findOneChat({
        filter:{
            participants:{$all:[meId , otherId]},
            group:{$exists: false}
        },
        options:{
            populate:[{path:'participants' , select:'firstName lastName email gender profilePicture'}]
        },
        page,
        size
    })
    if(!chat) {
        throw new BadRequest("Failed to find chatting instance")
    }
    return successResponse<IGetChatResponse>({res , data:{chat}})
}

createChattingGroup = async(req:Request , res:Response):Promise<Response> => {
const {group , participants}:ICreateChattingGroupParamsDto = req.body
const dbParticipants = participants.map((participant:string) => {
    return Types.ObjectId.createFromHexString(participant)
})
const users = await this.userModel.find({
    filter:{
        _id: {$in: dbParticipants},
        friends: {$in: req.user?._id as Types.ObjectId}
    },
})
if(participants.length != users.length) {
throw new Notfound("some or all recipient are invalid")
}
let group_image:string | undefined = undefined;
const roomId = group.replaceAll(/\s+/g , "_") + "_" + uuid()
if(req.file) {
    group_image = await uploadFile({file: req.file as Express.Multer.File , path:`chat/${roomId}`})
}
dbParticipants.push(req.user?._id as Types.ObjectId)
const [chat] = await this.chatModel.create({
    data:[{
        createdBy: req.user?._id as Types.ObjectId,
        group,
        roomId,
        group_image: group_image as string,
        messages:[],
        participants:dbParticipants
    }]
}) || []
if(!chat) {
    if(group_image) {
        await deleteFile({Key: group_image})
    }
throw new BadRequest("Fail to generate this group")
}
    return successResponse<IGetChatResponse>({res , statusCode:201 , data: {chat}})
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
            io?.to(connectedSockets.get(sendTo) || []).emit("newMessage" , {content , from: socket.credentials?.user})
} catch (error) {
            return socket.emit("custom_error" , error)
        }
    }
}