import {z} from 'zod'
import { IMainDto } from "../gateway";
import { getChat } from './chat.validation';

export type IGetChatParamsDto = z.infer<typeof getChat.params>
export interface ISayHiDto extends IMainDto{
    message:string;
}
export interface ISendMessageDto extends IMainDto{
    content:string;
    sendTo:string;
}