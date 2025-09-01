import type { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { sign, verify } from "jsonwebtoken";
import {
  HUserDocument,
  RoleEnum,
  UserModel,
} from "../../../DB/models/User.model";
import { BadRequest, Unauthorized } from "../response/error.response";
import { UserRepository } from "../../../DB/repository/user.repository";

export enum SignatureLevelEnum {
  Bearer = "bearer",
  System = "system",
}

export enum TokenEnum {
  access = "access",
  refresh = "refresh",
}

export const generateToken = async ({
  payload,
  secret = process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
  options = { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) },
}: {
  payload: object;
  secret?: Secret;
  options?: SignOptions;
}): Promise<string> => {
  return sign(payload, secret, options);
};

export const verifyToken = async ({
  token,
  secret = process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
}: {
  token: string;
  secret?: Secret;
}): Promise<JwtPayload> => {
  return verify(token, secret) as JwtPayload;
};

export const detectSignatureLevel = async (
  role: RoleEnum = RoleEnum.user
): Promise<SignatureLevelEnum> => {
  let signatureLevel: SignatureLevelEnum = SignatureLevelEnum.Bearer;
  switch (role) {
    case RoleEnum.admin:
      signatureLevel = SignatureLevelEnum.System;
      break;
    default:
      signatureLevel = SignatureLevelEnum.Bearer;
      break;
  }
  return signatureLevel;
};

export const getSignature = async (
  signatureLevel: SignatureLevelEnum = SignatureLevelEnum.Bearer
): Promise<{ access_signature: string; refresh_signature: string }> => {
  let signatures: { access_signature: string; refresh_signature: string } = {
    access_signature: "",
    refresh_signature: "",
  };

  switch (signatureLevel) {
    case SignatureLevelEnum.System:
      (signatures.access_signature = process.env
        .ACCESS_SYSTEM_TOKEN_SIGNATURE as string),
        (signatures.refresh_signature = process.env
          .REFRESH_SYSTEM_TOKEN_SIGNATURE as string);
      break;

    default:
      (signatures.access_signature = process.env
        .ACCESS_USER_TOKEN_SIGNATURE as string),
        (signatures.refresh_signature = process.env
          .REFRESH_USER_TOKEN_SIGNATURE as string);
      break;
  }
  return signatures;
};

export const loginCredentials = async (user: HUserDocument) => {
  const signatureLevel = await detectSignatureLevel(user.role);
  const signatures = await getSignature(signatureLevel);
  console.log(signatures);

  const access_token = await generateToken({
    payload: { _id: user._id },
    secret: signatures.access_signature,
    options: { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) },
  });

  const refresh_token = await generateToken({
    payload: { _id: user._id },
    secret: signatures.refresh_signature,
    options: { expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN) },
  });
  return { access_token, refresh_token };
};

export const decodeToken = async ({
  authorization,
  tokenType = TokenEnum.access,
}: {
  authorization: string;
  tokenType?: TokenEnum;
}) => {
    const userModel = new UserRepository(UserModel)
  const [bearerKey, token] = authorization.split(" ");
  if (!bearerKey || !token) {
    throw new Unauthorized("Missing token parts");
  }
  const signatures = await getSignature(bearerKey as SignatureLevelEnum);
  const decoded = await verifyToken({
    token,
    secret:
      tokenType === TokenEnum.refresh
        ? signatures.refresh_signature
        : signatures.access_signature,
  });
  if (!decoded?._id || !decoded?.iat) {
    throw new BadRequest("Invalid token payload");
  }
  const user = await userModel.findOne(
    {filter:{ _id: decoded._id }});
if(!user) {
    throw new BadRequest("Vot registered account")
}
  return {user, decoded};
};
