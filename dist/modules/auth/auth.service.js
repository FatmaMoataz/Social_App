"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_model_1 = require("../../DB/models/User.model");
const user_repository_1 = require("../../DB/repository/user.repository");
const error_response_1 = require("../utils/response/error.response");
const hash_security_1 = require("../utils/security/hash.security");
const email_event_1 = require("../utils/events/email.event");
const otp_1 = require("../utils/otp");
const token_security_1 = require("../utils/security/token.security");
const google_auth_library_1 = require("google-auth-library");
class AuthenticationService {
    userModel = new user_repository_1.UserRepository(User_model_1.UserModel);
    constructor() {
    }
    async verifyGmailAccount(idToken) {
        const client = new google_auth_library_1.OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.WEB_CLIENT_IDS?.split(",") || [],
        });
        const payload = ticket.getPayload();
        if (!payload?.email_verified) {
            throw new error_response_1.BadRequest("Fail to verify this google account");
        }
        return payload;
    }
    /**
     *
     * @param req - Express.Request
     * @param res - Express.Response
     * @returns Promise<Response>
     * @example({username, email, password}: ISignupBodyInputsDto)
     * return {message:'Done', statusCode:201}
     */
    loginWithGmail = async (req, res) => {
        const { idToken } = req.body;
        const { email } = await this.verifyGmailAccount(idToken);
        const user = await this.userModel.findOne({
            filter: {
                email,
                provider: User_model_1.ProviderEnum.GOOGLE
            }
        });
        if (!user) {
            throw new error_response_1.Notfound("Not registered account or Registered with another provider");
        }
        const credentials = await (0, token_security_1.loginCredentials)(user);
        return res.json({ message: "Done", data: { credentials } });
    };
    signupWithGmail = async (req, res) => {
        const { idToken } = req.body;
        const { email, family_name, given_name, name, picture } = await this.verifyGmailAccount(idToken);
        const user = await this.userModel.findOne({
            filter: {
                email
            }
        });
        if (user) {
            if (user.provider === User_model_1.ProviderEnum.GOOGLE) {
                return await this.loginWithGmail(req, res);
            }
            throw new error_response_1.Conflict(`Email exist with another provider ${user.provider}`);
        }
        const [newUser] = (await this.userModel.create({
            data: [{
                    email: email,
                    firstname: given_name,
                    lastname: family_name,
                    profileImg: picture,
                    confirmedAt: new Date(),
                    provider: User_model_1.ProviderEnum.GOOGLE
                }]
        })) || [];
        if (!newUser) {
            throw new error_response_1.BadRequest("Failed to signup with gmail please try again later");
        }
        const credentials = await (0, token_security_1.loginCredentials)(newUser);
        return res.status(201).json({ message: "Done", data: { credentials } });
    };
    signup = async (req, res) => {
        let { username, email, password } = req.body;
        const checkUserExist = await this.userModel.findOne({
            filter: { email },
            select: "email",
            options: {
                lean: true
            }
        });
        if (checkUserExist) {
            throw new error_response_1.Conflict("Email already exists");
        }
        const otp = (0, otp_1.generateNumberOtp)();
        const user = await this.userModel.createUser({
            data: [{ username, email, password: await (0, hash_security_1.generateHash)(password), confirmEmailOtp: await (0, hash_security_1.generateHash)(String(otp)), gender: req.body.gender }]
        });
        email_event_1.emailEvent.emit("confirmEmail", { to: email, otp });
        return res.status(201).json({ message: "Done", data: { user } });
    };
    confirmEmail = async (req, res) => {
        const { email, otp } = req.body;
        const user = await this.userModel.findOne({
            filter: { email, confirmEmailOtp: { $exists: true }, confirmedAt: { $exists: false } }
        });
        if (!user) {
            throw new error_response_1.Notfound("Invalid account");
        }
        if (!await (0, hash_security_1.compareHash)(otp, user.confirmEmailOtp)) {
            throw new error_response_1.Conflict("Invalid confirmation code");
        }
        await this.userModel.updateOne({
            filter: { email },
            update: {
                confirmedAt: new Date(),
                $unset: { confirmEmailOtp: 1 }
            }
        });
        return res.status(201).json({ message: "Done" });
    };
    login = async (req, res) => {
        const { email, password } = req.body;
        const user = await this.userModel.findOne({
            filter: { email, provider: User_model_1.ProviderEnum.SYSTEM }
        });
        if (!user || !(await (0, hash_security_1.compareHash)(password, user.password))) {
            throw new error_response_1.Notfound("Invalid login credentials");
        }
        if (!user.confirmedAt) {
            throw new error_response_1.BadRequest("Verify your account first");
        }
        const credentials = await (0, token_security_1.loginCredentials)(user);
        return res.json({ message: "Done", data: { credentials } });
    };
    sendForgotCode = async (req, res) => {
        const { email } = req.body;
        const user = await this.userModel.findOne({
            filter: { email, provider: User_model_1.ProviderEnum.SYSTEM, confirmedAt: { $exists: true } }
        });
        if (!user) {
            throw new error_response_1.Notfound("Invalid account: not registered, invalid provider or not confirmed");
        }
        const otp = (0, otp_1.generateNumberOtp)();
        const result = await this.userModel.updateOne({
            filter: { email },
            update: {
                resetPasswordOtp: await (0, hash_security_1.generateHash)(String(otp))
            }
        });
        if (!result.matchedCount) {
            throw new error_response_1.BadRequest("Failed to send the reset code please try again later");
        }
        email_event_1.emailEvent.emit("resetPassword", { to: email, otp });
        return res.json({ message: "Done", data: { otp } });
    };
    verifyForgotCode = async (req, res) => {
        const { email, otp } = req.body;
        const user = await this.userModel.findOne({
            filter: { email, provider: User_model_1.ProviderEnum.SYSTEM, resetPasswordOtp: { $exists: true } }
        });
        if (!user) {
            throw new error_response_1.Notfound("Invalid account: not registered, invalid provider, not confirmed or missing reset password code");
        }
        if (!(await (0, hash_security_1.compareHash)(otp, user.resetPasswordOtp))) {
            throw new error_response_1.Notfound("Invalid otp");
        }
        return res.json({ message: "Done", data: { otp } });
    };
    resetForgotCode = async (req, res) => {
        const { email, otp, password } = req.body;
        const user = await this.userModel.findOne({
            filter: { email, provider: User_model_1.ProviderEnum.SYSTEM, resetPasswordOtp: { $exists: true } }
        });
        if (!user) {
            throw new error_response_1.Notfound("Invalid account: not registered, invalid provider, not confirmed or missing reset password code");
        }
        if (!(await (0, hash_security_1.compareHash)(otp, user.resetPasswordOtp))) {
            throw new error_response_1.Conflict("Invalid otp");
        }
        const result = await this.userModel.updateOne({
            filter: { email },
            update: {
                password: await (0, hash_security_1.generateHash)(password),
                changeCredentials: new Date(),
                $unset: { resetPasswordOtp: 1 }
            }
        });
        if (!result.matchedCount) {
            throw new error_response_1.BadRequest("Failed to reset password");
        }
        return res.json({ message: "Done", data: { otp } });
    };
}
exports.default = new AuthenticationService;
