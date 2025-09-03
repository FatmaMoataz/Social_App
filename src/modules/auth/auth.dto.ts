import z from 'zod'
import * as validators from './auth.validation'

export type ISignupBodyInputsDto = z.infer<typeof validators.signup.body>
export type IConfirmEmailBodyInputsDto = z.infer<typeof validators.confirmEmail.body>
export type ILoginBodyInputsDto = z.infer<typeof validators.login.body>
export type IGmail = z.infer<typeof validators.signupWithGmail.body>
