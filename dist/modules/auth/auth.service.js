"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_model_1 = require("../../DB/models/User.model");
const user_repository_1 = require("../../DB/repository/user.repository");
const error_response_1 = require("../utils/response/error.response");
const hash_security_1 = require("../utils/security/hash.security");
const email_event_1 = require("../utils/events/email.event");
const otp_1 = require("../utils/otp");
const token_security_1 = require("../utils/security/token.security");
class AuthenticationService {
    userModel = new user_repository_1.UserRepository(User_model_1.UserModel);
    constructor() {
    }
    /**
     *
     * @param req - Express.Request
     * @param res - Express.Response
     * @returns Promise<Response>
     * @example({username, email, password}: ISignupBodyInputsDto)
     * return {message:'Done', statusCode:201}
     */
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
            data: [{ username, email, password: await (0, hash_security_1.generateHash)(password), confirmEmailOtp: await (0, hash_security_1.generateHash)(String(otp)) }]
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
            filter: { email }
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
}
exports.default = new AuthenticationService;
