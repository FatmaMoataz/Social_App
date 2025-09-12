import { RoleEnum } from "../../DB/models/User.model";

export const endpoint = {
    profile:[RoleEnum.user, RoleEnum.admin],
    restoreAccount:[RoleEnum.admin],
    hardDelete:[RoleEnum.admin]
}