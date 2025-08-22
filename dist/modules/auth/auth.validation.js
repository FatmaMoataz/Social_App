"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmEmail = exports.sendEmail = exports.login = exports.signup = void 0;
const zod_1 = require("zod");
exports.signup = {
    body: zod_1.z
        .object({
        username: zod_1.z.string().min(5).max(20),
        email: zod_1.z.email(),
        password: zod_1.z
            .string()
            .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/, "Password must contain at least 8 characters, one uppercase, one lowercase, and one number"),
        confirmPassword: zod_1.z.string(),
    })
        .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }),
};
exports.login = {
    body: zod_1.z.object({
        email: zod_1.z.email(),
        password: zod_1.z
            .string()
            .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/, "Invalid email or password format"),
    }),
};
exports.sendEmail = {
    body: zod_1.z.object({
        email: zod_1.z.email()
    })
};
exports.confirmEmail = {
    body: zod_1.z.object({
        email: zod_1.z.email(),
        otp: zod_1.z.string().length(6)
    })
};
