"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import express, {type Express, type Request, type Response} from "express"
const node_path_1 = require("node:path");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: (0, node_path_1.resolve)("./config/.env.development") });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = require("express-rate-limit");
const auth_controller_1 = __importDefault(require("./modules/auth/auth.controller"));
const user_controller_1 = __importDefault(require("./modules/user/user.controller"));
const error_response_1 = require("./modules/utils/response/error.response");
const connection_db_js_1 = __importDefault(require("./DB/connection.db.js"));
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 6000,
    limit: 2000,
    message: { error: "Too many request please try again later" }
});
const bootstrap = async () => {
    const app = (0, express_1.default)();
    const port = process.env.PORT || 5000;
    app.use((0, cors_1.default)(), express_1.default.json(), (0, helmet_1.default)());
    app.use(limiter);
    await (0, connection_db_js_1.default)();
    // app-routing
    app.get('/', (req, res) => {
        res.json({ message: `Welcome to ${process.env.APPLICATION_NAME} backend landing page` });
    });
    // modules
    app.use("/auth", auth_controller_1.default);
    app.use("/user", user_controller_1.default);
    app.use(error_response_1.globalErrorHandling);
    // invalid route
    app.use("{/*dummy}", (req, res) => { return res.status(404).json({ message: 'Invalid routing' }); });
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};
exports.default = bootstrap;
