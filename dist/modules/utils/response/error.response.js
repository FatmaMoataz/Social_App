"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandling = exports.Conflict = exports.Notfound = exports.BadRequest = exports.AppError = void 0;
class AppError extends Error {
    message;
    statusCode;
    cause;
    constructor(message, statusCode, cause) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.cause = cause;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class BadRequest extends AppError {
    constructor(message, cause) {
        super(message, 400, cause);
    }
}
exports.BadRequest = BadRequest;
class Notfound extends AppError {
    constructor(message, cause) {
        super(message, 404, cause);
    }
}
exports.Notfound = Notfound;
class Conflict extends AppError {
    constructor(message, cause) {
        super(message, 409, cause);
    }
}
exports.Conflict = Conflict;
const globalErrorHandling = (error, req, res, next) => {
    return res.status(error.statusCode || 500).json({
        error_message: error.message || "something went wrong",
        stack: process.env.MOOD === "development" ? error.stack : undefined,
        cause: error.cause
    });
};
exports.globalErrorHandling = globalErrorHandling;
