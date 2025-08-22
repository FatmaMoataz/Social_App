"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = void 0;
const error_response_1 = require("../modules/utils/response/error.response");
const validation = (schema) => {
    return (req, res, next) => {
        const validationErrors = [];
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            const validationResult = schema[key].safeParse(req[key]);
            if (!validationResult.success) {
                const errors = validationResult.error;
                validationErrors.push({
                    key,
                    issues: errors.issues.map((issue) => ({
                        message: issue.message,
                        path: issue.path[0],
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
