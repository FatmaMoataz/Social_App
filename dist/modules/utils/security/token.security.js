"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRevokeToken = exports.decodeToken = exports.loginCredentials = exports.getSignature = exports.detectSignatureLevel = exports.verifyToken = exports.generateToken = exports.LogoutEnum = exports.TokenEnum = exports.SignatureLevelEnum = void 0;
const uuid_1 = require("uuid");
const jsonwebtoken_1 = require("jsonwebtoken");
const User_model_1 = require("../../../DB/models/User.model");
const error_response_1 = require("../response/error.response");
const Token_model_1 = require("../../../DB/models/Token.model");
const repository_1 = require("../../../DB/repository");
var SignatureLevelEnum;
(function (SignatureLevelEnum) {
    SignatureLevelEnum["Bearer"] = "bearer";
    SignatureLevelEnum["System"] = "system";
})(SignatureLevelEnum || (exports.SignatureLevelEnum = SignatureLevelEnum = {}));
var TokenEnum;
(function (TokenEnum) {
    TokenEnum["access"] = "access";
    TokenEnum["refresh"] = "refresh";
})(TokenEnum || (exports.TokenEnum = TokenEnum = {}));
var LogoutEnum;
(function (LogoutEnum) {
    LogoutEnum["only"] = "only";
    LogoutEnum["all"] = "all";
})(LogoutEnum || (exports.LogoutEnum = LogoutEnum = {}));
const generateToken = async ({ payload, secret = process.env.ACCESS_USER_TOKEN_SIGNATURE, options = { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) }, }) => {
    return (0, jsonwebtoken_1.sign)(payload, secret, options);
};
exports.generateToken = generateToken;
const verifyToken = async ({ token, secret = process.env.ACCESS_USER_TOKEN_SIGNATURE, }) => {
    return (0, jsonwebtoken_1.verify)(token, secret);
};
exports.verifyToken = verifyToken;
const detectSignatureLevel = async (role = User_model_1.RoleEnum.user) => {
    let signatureLevel = SignatureLevelEnum.Bearer;
    switch (role) {
        case User_model_1.RoleEnum.admin:
            signatureLevel = SignatureLevelEnum.System;
            break;
        default:
            signatureLevel = SignatureLevelEnum.Bearer;
            break;
    }
    return signatureLevel;
};
exports.detectSignatureLevel = detectSignatureLevel;
const getSignature = async (signatureLevel = SignatureLevelEnum.Bearer) => {
    let signatures = {
        access_signature: "",
        refresh_signature: "",
    };
    switch (signatureLevel) {
        case SignatureLevelEnum.System:
            (signatures.access_signature = process.env
                .ACCESS_SYSTEM_TOKEN_SIGNATURE),
                (signatures.refresh_signature = process.env
                    .REFRESH_SYSTEM_TOKEN_SIGNATURE);
            break;
        default:
            (signatures.access_signature = process.env
                .ACCESS_USER_TOKEN_SIGNATURE),
                (signatures.refresh_signature = process.env
                    .REFRESH_USER_TOKEN_SIGNATURE);
            break;
    }
    return signatures;
};
exports.getSignature = getSignature;
const loginCredentials = async (user) => {
    const signatureLevel = await (0, exports.detectSignatureLevel)(user.role);
    const signatures = await (0, exports.getSignature)(signatureLevel);
    const jwtid = (0, uuid_1.v4)();
    const access_token = await (0, exports.generateToken)({
        payload: { _id: user._id, jti: jwtid },
        secret: signatures.access_signature,
        options: { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) },
    });
    const refresh_token = await (0, exports.generateToken)({
        payload: { _id: user._id, jti: jwtid },
        secret: signatures.refresh_signature,
        options: { expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN) },
    });
    return { access_token, refresh_token };
};
exports.loginCredentials = loginCredentials;
const decodeToken = async ({ authorization, tokenType = TokenEnum.access, }) => {
    if (!authorization)
        throw new error_response_1.Unauthorized("Missing authorization header");
    const [bearerKey, token] = authorization.split(" ");
    if (!bearerKey || !token) {
        throw new error_response_1.Unauthorized("Missing token parts");
    }
    const userModel = new repository_1.UserRepository(User_model_1.UserModel);
    const tokenModel = new repository_1.TokenRepository(Token_model_1.TokenModel);
    const signatures = await (0, exports.getSignature)(bearerKey);
    const decoded = await (0, exports.verifyToken)({
        token,
        secret: tokenType === TokenEnum.refresh
            ? signatures.refresh_signature
            : signatures.access_signature,
    });
    if (!decoded?._id || !decoded?.jti || !decoded?.iat) {
        throw new error_response_1.BadRequest("Invalid token payload");
    }
    if (await tokenModel.findOne({ filter: { jti: decoded.jti } })) {
        throw new error_response_1.Unauthorized("Invalid or Old login credentials");
    }
    const user = await userModel.findOne({ filter: { _id: decoded._id } });
    if (!user) {
        throw new error_response_1.BadRequest("Not a registered account");
    }
    if ((user.changeCredentialsTime?.getTime() || 0) > decoded.iat * 1000) {
        throw new error_response_1.Unauthorized("Invalid or Old login credentials");
    }
    return { user, decoded };
};
exports.decodeToken = decodeToken;
const createRevokeToken = async (decoded) => {
    const tokenModel = new repository_1.TokenRepository(Token_model_1.TokenModel);
    const [result] = await tokenModel.create({
        data: [
            {
                jti: decoded.jti,
                expiresIn: decoded.iat + Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
                userId: decoded._id
            }
        ]
    }) || [];
    if (!result) {
        throw new error_response_1.BadRequest("Failed to revoke this token 😢");
    }
    return result;
};
exports.createRevokeToken = createRevokeToken;
