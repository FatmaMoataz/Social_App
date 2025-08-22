export interface ISignupBodyInputsDto {
    username:string,
    email:string,
    password:string,
    confirmPassword:string
}

export interface ILoginBodyInputsDto {
    email:string,
    password:string
}

export interface IConfirmEmailBodyInputsDto {
    email:string,
    otp:string
}

export interface ISendEmailBodyInputsDto {
  email: string;
}
