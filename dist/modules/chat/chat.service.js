"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const success_response_1 = require("../utils/response/success.response");
const repository_1 = require("../../DB/repository");
const models_1 = require("../../DB/models");
const mongoose_1 = require("mongoose");
const error_response_1 = require("../utils/response/error.response");
const gateway_1 = require("../gateway");
const s3_config_1 = require("../utils/multer/s3.config");
const uuid_1 = require("uuid");
class ChatService {
    userModel = new repository_1.UserRepository(models_1.UserModel);
    chatModel = new repository_1.ChatRepository(models_1.ChatModel);
    constructor() { }
    //REST API
    getChat = async (req, res) => {
        const { userId } = req.params;
        const { page, size } = req.query;
        const meRaw = req.user?._id;
        const meIdStr = String(meRaw ?? "");
        if (!mongoose_1.Types.ObjectId.isValid(meIdStr) || !mongoose_1.Types.ObjectId.isValid(userId)) {
            throw new error_response_1.BadRequest("Invalid user id");
        }
        const meId = new mongoose_1.Types.ObjectId(meIdStr);
        const otherId = new mongoose_1.Types.ObjectId(userId);
        const chat = await this.chatModel.findOneChat({
            filter: {
                participants: { $all: [meId, otherId] },
                group: { $exists: false },
            },
            options: {
                populate: [
                    {
                        path: "participants",
                        select: "firstName lastName email gender profilePicture",
                    },
                ],
            },
            page,
            size,
        });
        if (!chat) {
            throw new error_response_1.BadRequest("Failed to find chatting instance");
        }
        return (0, success_response_1.successResponse)({ res, data: { chat } });
    };
    getChattingGroup = async (req, res) => {
        const { groupId } = req.params;
        const { page, size } = req.query;
        const chat = await this.chatModel.findOneChat({
            filter: {
                _id: mongoose_1.Types.ObjectId.createFromHexString(groupId),
                participants: { $in: req.user?._id },
                group: { $exists: true },
            },
            options: {
                populate: [
                    {
                        path: "messages.createdBy",
                        select: "firstName lastName email gender profilePicture",
                    },
                ],
            },
            page,
            size,
        });
        if (!chat) {
            throw new error_response_1.BadRequest("Failed to find chatting instance");
        }
        return (0, success_response_1.successResponse)({ res, data: { chat } });
    };
    createChattingGroup = async (req, res) => {
        const { group, participants } = req.body;
        const dbParticipants = participants.map((participant) => {
            return mongoose_1.Types.ObjectId.createFromHexString(participant);
        });
        const users = await this.userModel.find({
            filter: {
                _id: { $in: dbParticipants },
                friends: { $in: req.user?._id },
            },
        });
        if (participants.length != users.length) {
            throw new error_response_1.Notfound("some or all recipient are invalid");
        }
        let group_image = undefined;
        const roomId = group.replaceAll(/\s+/g, "_") + "_" + (0, uuid_1.v4)();
        if (req.file) {
            group_image = await (0, s3_config_1.uploadFile)({
                file: req.file,
                path: `chat/${roomId}`,
            });
        }
        dbParticipants.push(req.user?._id);
        const [chat] = (await this.chatModel.create({
            data: [
                {
                    createdBy: req.user?._id,
                    group,
                    roomId,
                    group_image: group_image,
                    messages: [],
                    participants: dbParticipants,
                },
            ],
        })) || [];
        if (!chat) {
            if (group_image) {
                await (0, s3_config_1.deleteFile)({ Key: group_image });
            }
            throw new error_response_1.BadRequest("Fail to generate this group");
        }
        return (0, success_response_1.successResponse)({
            res,
            statusCode: 201,
            data: { chat },
        });
    };
    // IO
    sayHi = ({ message, socket, callback, io }) => {
        try {
            console.log(message);
            callback ? callback("Hello BE To FE") : undefined;
        }
        catch (error) {
            return socket.emit("custom_error", error);
        }
    };
    // SEND OVO MESSAGE
    sendMessage = async ({ content, sendTo, socket, io }) => {
        try {
            const rawId = socket.credentials?.user._id;
            const idStr = String(rawId ?? "");
            if (!mongoose_1.Types.ObjectId.isValid(idStr)) {
                return socket.emit("custom_error", new error_response_1.BadRequest("Invalid sender id"));
            }
            const createdBy = new mongoose_1.Types.ObjectId(idStr);
            if (!mongoose_1.Types.ObjectId.isValid(sendTo)) {
                return socket.emit("custom_error", new error_response_1.BadRequest("Invalid recipient id"));
            }
            const sendToId = new mongoose_1.Types.ObjectId(sendTo);
            const user = await this.userModel.findOne({
                filter: {
                    _id: sendToId,
                    friends: { $in: createdBy },
                },
            });
            if (!user) {
                throw new error_response_1.Notfound("Invalid recipient friend");
            }
            const chat = await this.chatModel.findOneAndUpdate({
                filter: {
                    participants: { $all: [createdBy, sendToId] },
                    group: { $exists: false },
                },
                update: {
                    $addToSet: { messages: { content, createdBy } },
                },
            });
            if (!chat) {
                const [newChat] = (await this.chatModel.create({
                    data: [
                        {
                            createdBy,
                            messages: [{ content, createdBy }],
                            participants: [createdBy, sendToId],
                        },
                    ],
                })) || [];
                if (!newChat) {
                    throw new error_response_1.BadRequest("Failed to create this chat");
                }
            }
            io?.to(gateway_1.connectedSockets.get(createdBy.toString()) || []).emit("successMessage", { content });
            io?.to(gateway_1.connectedSockets.get(sendTo) || []).emit("newMessage", {
                content,
                from: socket.credentials?.user,
            });
        }
        catch (error) {
            return socket.emit("custom_error", error);
        }
    };
    sendGroupMessage = async ({ content, groupId, socket, io }) => {
        try {
            // validate sender id from socket and convert to ObjectId
            const rawId = socket.credentials?.user._id;
            const senderIdStr = String(rawId ?? "");
            if (!mongoose_1.Types.ObjectId.isValid(senderIdStr)) {
                return socket.emit("custom_error", new error_response_1.BadRequest("Invalid sender id"));
            }
            const createdBy = new mongoose_1.Types.ObjectId(senderIdStr);
            // validate groupId and convert
            if (!mongoose_1.Types.ObjectId.isValid(String(groupId))) {
                return socket.emit("custom_error", new error_response_1.BadRequest("Invalid group id"));
            }
            const groupObjectId = new mongoose_1.Types.ObjectId(String(groupId));
            // update chat (cast update to any to satisfy TS if model types are narrow)
            const chat = await this.chatModel.findOneAndUpdate({
                filter: {
                    _id: groupObjectId,
                    participants: { $in: [createdBy] },
                    group: { $exists: true },
                },
                update: {
                    $addToSet: { messages: { content, createdBy } },
                },
            });
            if (!chat) {
                throw new error_response_1.BadRequest("Failed to find matching room");
            }
            // emit to sender's sockets and to room
            io?.to(gateway_1.connectedSockets.get(createdBy.toString()) || []).emit("successMessage", { content });
            socket?.to(chat.roomId).emit("newMessage", {
                content,
                from: socket.credentials?.user,
                groupId,
            });
        }
        catch (error) {
            return socket.emit("custom_error", error);
        }
    };
    joinRoom = async ({ roomId, socket, io }) => {
        try {
            const chat = await this.chatModel.findOne({
                filter: {
                    roomId,
                    group: { $exists: true },
                    participants: { $in: socket.credentials?.user._id }
                }
            });
            if (!chat) {
                throw new error_response_1.Notfound("Fail to find matching room");
            }
            socket.join(chat.roomId);
        }
        catch (error) {
            return socket.emit("custom_error", error);
        }
    };
}
exports.ChatService = ChatService;
