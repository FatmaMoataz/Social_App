import { HydratedDocument, model, models, Schema, Types } from "mongoose"

export interface IMessage {
    content:string
    createdBy:Types.ObjectId
    createdAt?:Date
    updatedAt?:Date
}
export type HMessageDocument = HydratedDocument<IMessage>

export interface IChat {
    // OVO (ONE VS ONE)
    participants:Types.ObjectId[]
messages:[]
// OVM (ONE VS MANY)
group?:string
group_image?:string
roomId?:string
// COMMON
createdBy:Types.ObjectId
    createdAt:Date
    updatedAt?:Date

}

export type HChatDocument = HydratedDocument<IChat>
const messageSchema = new Schema<IMessage>({
    content:{type:String , minlength:2 , maxlength: 50000 , required:true},
    createdBy:{type:Schema.Types.ObjectId, ref:"User", required:true}
} , {timestamps:true})
const ChatSchema = new Schema<IChat>({
    participants:[
        {
            type:Schema.Types.ObjectId , ref:"User" , required:true
        }
    ],
    createdBy: {type:Schema.Types.ObjectId, ref:"User", required:true},
    group: {type:String},
    group_image: {type:String},
    roomId: {type:String , required: function() {
        return this.roomId
    }},
    messages:[messageSchema]
}, {
    timestamps:true,
    // strictQuery:true,
    // toObject:{virtuals:true},
    // toJSON:{virtuals:true}
})

// ChatSchema.pre(["find", "findOne", "countDocuments"], function(next) {
//   const query = this.getQuery()
// if(query.paranoid === false) {
// this.setQuery({...query})
// }
// else {
//   this.setQuery({...query, freezedAt:{$exists:false}})
// }
//   next()
// })

// ChatSchema.pre(["findOneAndUpdate", "updateOne"], function(next) {
//       const query = this.getQuery()
// if(query.paranoid === false) {
// this.setQuery({...query})
// }
// else {
//   this.setQuery({...query, freezedAt:{$exists:false}})
// }
// next()
// })

// ChatSchema.virtual("reply", {
//   localField:"_id",
//   foreignField:"ChatId",
//   ref:"Chat",
// justOne:true
// })

export const ChatModel = models.Chat || model<IChat>("Chat", ChatSchema)