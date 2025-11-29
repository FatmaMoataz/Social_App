"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIo = exports.initializeIo = exports.connectedSockets = void 0;
const socket_io_1 = require("socket.io");
const token_security_1 = require("../utils/security/token.security");
const error_response_1 = require("../utils/response/error.response");
const chat_1 = require("../chat");
exports.connectedSockets = new Map();
let io = undefined;
const initializeIo = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "*",
        },
    });
    io.use(async (socket, next) => {
        try {
            const { user, decoded } = await (0, token_security_1.decodeToken)({
                authorization: socket.handshake?.auth.authorization || "",
                tokenType: token_security_1.TokenEnum.access,
            });
            const userId = String(user?._id ?? user?.id ?? "");
            if (!userId) {
                throw new error_response_1.BadRequest("Invalid user id in token");
            }
            const userTabs = exports.connectedSockets.get(userId) || [];
            userTabs.push(socket.id);
            exports.connectedSockets.set(userId, userTabs);
            socket.credentials = { user: { ...user, _id: userId }, decoded };
            next();
        }
        catch (error) {
            next(error);
        }
    });
    function disconnection(socket) {
        return socket.on("disconnect", () => {
            const userId = socket.credentials?.user._id?.toString();
            exports.connectedSockets.delete(userId);
            (0, exports.getIo)().emit("offline_user", userId);
        });
    }
    // http://localhost:3000/
    const chatGateway = new chat_1.ChatGateway();
    io.on("connection", (socket) => {
        chatGateway.register(socket, (0, exports.getIo)());
        disconnection(socket);
    });
};
exports.initializeIo = initializeIo;
const getIo = () => {
    if (!io) {
        throw new error_response_1.BadRequest("Fail to stablish server socket Io");
    }
    return io;
};
exports.getIo = getIo;
