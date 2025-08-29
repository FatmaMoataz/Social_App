import type { NextFunction, Request, Response } from "express";
import { ZodError, ZodType } from "zod";
import { BadRequest } from "../modules/utils/response/error.response";
import { z } from "zod";

type KeyReqType = keyof Request; // 'body' | 'params' | 'query' | 'file'
type SchemaType = Partial<Record<KeyReqType, ZodType>>;
type ValidationErrorsType = Array<{
  key: KeyReqType;
  issues: Array<{
    message: string;
    path: string | number | undefined;
  }>;
}>;

export const validation = (schema: SchemaType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validationErrors: ValidationErrorsType = [];

    for (const key of Object.keys(schema) as KeyReqType[]) {
      if (!schema[key]) continue;

      const validationResult = schema[key]!.safeParse(req[key]);
      if (!validationResult.success) {
        const errors = validationResult.error as ZodError;
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
      throw new BadRequest("Validation Error", {
        validationErrors,
      });
    }

    next();
  };
};

export const generalFields = {
        username: z.string().min(5).max(20),
      email: z.email(),
      otp: z.string().regex(/^\d{6}$/),
      password: z
        .string()
        .regex(
          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
          "Password must contain at least 8 characters, one uppercase, one lowercase, and one number"
        ),
      confirmPassword: z.string(),
}
