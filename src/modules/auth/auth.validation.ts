import { z } from "zod";
import { generalFields } from "../../middleware/validation.middleware";

export const login = {
  body: z
    .object({
      email: generalFields.email,
      password: generalFields.password,
    })
};

export const signup = {
  body: login.body.extend({
      username: generalFields.username,
      confirmPassword: generalFields.confirmPassword,
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
};

export const confirmEmail = {
  body: z.strictObject({
      email: generalFields.email,
      otp: generalFields.otp,
    })
};

// export const sendEmail = {
//   body: z.object({
//     email:z.email()
//   })
// }

