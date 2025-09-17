"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalFields = exports.validation = void 0;
const error_response_1 = require("../modules/utils/response/error.response");
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
const validation = (schema) => {
    return (req, res, next) => {
        const validationErrors = [];
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            if (req.file) {
                req.body.attachment = req.file;
            }
            if (req.files) {
                req.body.attachments = req.files;
            }
            const validationResult = schema[key].safeParse(req[key]);
            if (!validationResult.success) {
                const errors = validationResult.error;
                validationErrors.push({
                    key,
                    issues: errors.issues.map((issue) => ({
                        message: issue.message,
                        path: issue.path,
                    })),
                });
            }
        }
        if (validationErrors.length) {
            throw new error_response_1.BadRequest("Validation Error", {
                validationErrors,
            });
        }
        next();
    };
};
exports.validation = validation;
exports.generalFields = {
    username: zod_1.z.string().min(5).max(20),
    email: zod_1.z.email(),
    otp: zod_1.z.string().regex(/^\d{6}$/),
    password: zod_1.z
        .string()
        .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/, "Password must contain at least 8 characters, one uppercase, one lowercase, and one number"),
    confirmPassword: zod_1.z.string(),
    id: zod_1.z.string().refine(data => {
        mongoose_1.Types.ObjectId.isValid(data);
    }, { error: "Invalid objectId format" }),
    file: function (mimetype) {
        return zod_1.z.strictObject({
            fieldname: zod_1.z.string(),
            originalname: zod_1.z.string(),
            encoding: zod_1.z.string(),
            mimetype: zod_1.z.enum(mimetype),
            buffer: zod_1.z.any().optional(),
            path: zod_1.z.string().optional(),
            size: zod_1.z.number()
        }).refine(data => {
            return data.buffer || data.path;
        }, { error: "Neither path or buffer is available", path: ["file"] });
    }
};
