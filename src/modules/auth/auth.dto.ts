// export interface ISignupBodyInputsDto {
//     username:string,
//     email:string,
//     password:string,
//     confirmPassword:string
// }

// export interface ILoginBodyInputsDto {
//     email:string,
//     password:string
// }

// export interface IConfirmEmailBodyInputsDto {
//     email:string,
//     otp:string
// }

// export interface ISendEmailBodyInputsDto {
//   email: string;
// }
import z from 'zod'
import * as validators from './auth.validation'

export type ISignupBodyInputsDto = z.infer<typeof validators.signup.body>
export type IConfirmEmailBodyInputsDto = z.infer<typeof validators.confirmEmail.body>
