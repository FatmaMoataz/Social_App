"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = require("node:path");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: (0, node_path_1.resolve)("./config/.env.development") });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = require("express-rate-limit");
const modules_1 = require("./modules");
const error_response_1 = require("./modules/utils/response/error.response");
const connection_db_js_1 = __importDefault(require("./DB/connection.db.js"));
const s3_config_1 = require("./modules/utils/multer/s3.config");
const node_util_1 = require("node:util");
const node_stream_1 = require("node:stream");
const createS3WriteStreamPipe = (0, node_util_1.promisify)(node_stream_1.pipeline);
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 6000,
    limit: 2000,
    message: { error: "Too many request please try again later" },
});
const socket_io_1 = require("socket.io");
const token_security_1 = require("./modules/utils/security/token.security");
const connectedSockets = new Map();
const bootstrap = async () => {
    const app = (0, express_1.default)();
    const port = process.env.PORT || 5000;
    app.use((0, cors_1.default)(), express_1.default.json(), (0, helmet_1.default)());
    app.use(limiter);
    await (0, connection_db_js_1.default)();
    // app-routing
    app.get("/", (req, res) => {
        res.json({
            message: `Welcome to ${process.env.APPLICATION_NAME} backend landing page`,
        });
    });
    // modules
    app.use("/auth", modules_1.authRouter);
    app.use("/user", modules_1.userRouter);
    app.use("/post", modules_1.postRouter);
    app.use(error_response_1.globalErrorHandling);
    app.get("/uploads/*path", async (req, res) => {
        const { downloadName, download = "false" } = req.query;
        const { path } = req.params;
        const Key = path.join("/");
        const s3Response = await (0, s3_config_1.getFile)({ Key });
        if (!s3Response?.Body) {
            throw new error_response_1.BadRequest("Failed to fetch this asset");
        }
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
        res.setHeader("Content-type", `${s3Response.ContentType || "application/octet-stream"}`);
        if (download === "true") {
            res.setHeader("Content-Disposition", `attachments: filename="${downloadName || Key.split("/").pop()}"`);
        }
        return await createS3WriteStreamPipe(s3Response.Body, res);
    });
    app.get("/uploads/pre-signed/*path", async (req, res) => {
        const { downloadName, download = "false", expiresIn = 120, } = req.query;
        const { path } = req.params;
        const Key = path.join("/");
        const url = await (0, s3_config_1.createGetPreSignedLink)({
            Key,
            download,
            downloadName: downloadName,
            expiresIn,
        });
        return res.json({ message: "Done", data: { url } });
    });
    // invalid route
    app.use("{/*dummy}", (req, res) => {
        return res.status(404).json({ message: "Invalid routing" });
    });
    const httpServer = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
    const io = new socket_io_1.Server(httpServer, {
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
            // canonicalize/force a string id so TS no longer sees unknown
            const userId = String(user?._id ?? user?.id ?? "");
            if (!userId) {
                throw new error_response_1.BadRequest("Invalid user id in token");
            }
            const userTabs = connectedSockets.get(userId) || [];
            userTabs.push(socket.id);
            connectedSockets.set(userId, userTabs);
            // store credentials with _id as string to avoid unknown type later
            socket.credentials = { user: { ...user, _id: userId }, decoded };
            next();
        }
        catch (error) {
            next(error);
        }
    });
    // http://localhost:3000/
    io.on("connection", (socket) => {
        socket.emit("productStock", { productId: "d3h4tag", quantity: 5 });
        socket.on("disconnect", () => {
            const userId = socket.credentials?.user._id?.toString();
            const remainingTabs = connectedSockets.get(userId)?.filter((tab) => {
                return tab !== socket.id;
            }) || [];
            if (remainingTabs?.length) {
                connectedSockets.set(userId, remainingTabs);
            }
            else {
                io.emit("offline_user", userId);
            }
            connectedSockets.delete(userId);
            io.emit("offline_user", userId);
        });
    });
    // http://localhost:3000/admin
    // io.of("/admin").on("connection", (socket: Socket) => {
    // console.log(`Admin`, socket.id);
    // socket.on("disconnect" , () => {
    //     console.log(`logout from ${socket.id}`);
    // })
    // })
};
exports.default = bootstrap;
