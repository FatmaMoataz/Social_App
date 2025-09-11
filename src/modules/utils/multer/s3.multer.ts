import {EventEmitter} from 'node:events'
import { deleteFile, getFile } from './s3.config'
import { UserRepository } from '../../../DB/repository/user.repository'
import { UserModel } from '../../../DB/models/User.model'

export const s3Event = new EventEmitter({})

s3Event.on("trackProfileImgUpload", (data) => {
    const userModel = new UserRepository(UserModel)
setTimeout(async() => {
try {
    await getFile({Key: data.key})
    await userModel.updateOne({
            filter:{_id: data.userId},
            update:{
                $unset:{tempProfileImg:1}
            }
        })
    await deleteFile({Key:data.oldKey})

} catch (error:any) {

    if(error.Code === "NoSuchKey") {
        await userModel.updateOne({
            filter:{_id: data.userId},
            update:{
                profileImg: data.oldKey,
                $unset:{tempProfileImg:1}
            }
        })
    }  
}
}, data.expiresIn || Number(process.env.AWS_PRE_SIGNED_URL_EXPIRES_IN_SECONDS)*1000)
})