"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const uri = process.env.DB_URI;
        if (!uri) {
            throw new Error("DB_URI is not defined in .env file");
        }
        const conn = await mongoose_1.default.connect(uri, {
            serverSelectionTimeoutMS: 1000
        });
        console.log(`✅ DB connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error("❌ Failed to connect to DB", error);
        process.exit(1);
    }
};
exports.default = connectDB;
