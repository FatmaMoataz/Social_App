import {z} from 'zod'
import { IMainDto } from "../gateway";
import { createChattingGroup, getChat, getChattingGroup } from './chat.validation';

export type IGetChattingGroupParamsDto = z.infer<typeof getChattingGroup.params>
export type IGetChatParamsDto = z.infer<typeof getChat.params>
export type IGetChatQueryParamsDto = z.infer<typeof getChat.query>
export type ICreateChattingGroupParamsDto = z.infer<typeof createChattingGroup.body>
export interface ISayHiDto extends IMainDto{
    message:string;
}
export interface ISendMessageDto extends IMainDto{
    content:string;
    sendTo:string;
}

export interface IJoinRoomDto extends IMainDto{
    roomId:string;
}