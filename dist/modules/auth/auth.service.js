"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_response_1 = require("../utils/response/error.response");
const User_model_1 = require("../../DB/models/User.model");
const validators = __importStar(require("./auth.validation"));
const crypto_1 = __importDefault(require("crypto"));
const email_service_1 = require("../utils/email/email.service");
class AuthenticationService {
    constructor() { }
    signup = async (req, res) => {
        try {
            await validators.signup.body.parseAsync(req.body);
            const { username, email, password } = req.body;
            const userExist = await User_model_1.UserModel.findOne({ email });
            if (userExist) {
                throw new error_response_1.BadRequest("Email already exists", 400);
            }
            const newUser = new User_model_1.UserModel({ username, email, password });
            const otp = crypto_1.default.randomInt(100000, 999999).toString();
            newUser.emailOtp = otp;
            newUser.otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
            await newUser.save();
            await (0, email_service_1.sendEmail)(newUser.email, "Confirm your email", `<p>Your confirmation code is: <b>${otp}</b></p>`);
            return res.status(201).json({ message: "User created successfully", data: newUser });
        }
        catch (error) {
            if (error.errors || error.issues) {
                return res.status(400).json({
                    message: "Validation Error",
                    issues: error.issues || error.errors
                });
            }
            return res.status(error.statusCode || 500).json({ message: error.message || "Something went wrong" });
        }
    };
    login = async (req, res) => {
        try {
            let { email } = req.body;
            const userExist = await User_model_1.UserModel.findOne({ email });
            if (!userExist) {
                throw new error_response_1.BadRequest("Incorrect login credentials", 404);
            }
            return res.status(200).json({ message: "Successful Login" });
        }
        catch (e) {
            return res.status(e.statusCode || 500).json({ message: e.message || "Something went wrong" });
        }
    };
    confirmEmail = async (req, res) => {
        try {
            const { email, otp } = req.body;
            const user = await User_model_1.UserModel.findOne({ email });
            if (!user) {
                throw new error_response_1.BadRequest("Invalid account", 404);
            }
            if (user.confirmEmail) {
                return res.status(200).json({ message: "Email already confirmed" });
            }
            if (!user.emailOtp || user.emailOtp !== otp) {
                throw new error_response_1.BadRequest("Invalid or expired code", 400);
            }
            if (user.otpExpires && user.otpExpires < new Date()) {
                throw new error_response_1.BadRequest("Code expired, please request a new one", 400);
            }
            user.confirmEmail = true;
            user.emailOtp = undefined;
            user.otpExpires = undefined;
            await user.save();
            return res.status(200).json({ message: "Email confirmed successfully" });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({ message: error.message });
        }
    };
    sendEmail = async (req, res) => {
        try {
            const { email } = req.body;
            const user = await User_model_1.UserModel.findOne({ email });
            if (!user) {
                throw new error_response_1.BadRequest("Invalid account", 404);
            }
            if (user.confirmEmail) {
                return res.status(200).json({ message: "Email already confirmed" });
            }
            const otp = crypto_1.default.randomInt(100000, 999999).toString();
            user.emailOtp = otp;
            user.otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
            await user.save();
            await (0, email_service_1.sendEmail)(user.email, "Confirm your email", `<p>Your new confirmation code is: <b>${otp}</b></p>`);
            return res
                .status(200)
                .json({ message: "A new confirmation code has been sent to your email" });
        }
        catch (error) {
            return res
                .status(error.statusCode || 500)
                .json({ message: error.message || "Something went wrong" });
        }
    };
}
exports.default = new AuthenticationService;
