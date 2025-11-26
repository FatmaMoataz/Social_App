import { DatabaseRepository } from "./database.repository";
import {IChat as TDocument} from '../models/Chat.model'
import { Model } from "mongoose";

export class ChatRepository extends DatabaseRepository<TDocument> {
constructor(protected override readonly model:Model<TDocument>){
    super(model)
}
}