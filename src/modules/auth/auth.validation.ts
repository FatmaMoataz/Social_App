import { z } from "zod";

export const signup = {
  body: z
    .object({
      username: z.string().min(5).max(20),
      email: z.email(),
      password: z
        .string()
        .regex(
          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
          "Password must contain at least 8 characters, one uppercase, one lowercase, and one number"
        ),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
};

export const login = {
  body: z.object({
    email: z.email(),
    password: z
      .string()
      .regex(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
        "Invalid email or password format"
      ),
  }),
};

export const sendEmail = {
  body: z.object({
    email:z.email()
  })
}

export const confirmEmail = {
  body: z.object({
    email:z.email(),
    otp:z.string().length(6)
  })
}