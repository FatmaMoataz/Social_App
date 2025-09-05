import { GetObjectCommand, GetObjectCommandOutput, ObjectCannedACL, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { v4 as uuid } from 'uuid'
import { StorageEnum } from './cloud.multer'
import { createReadStream } from 'node:fs'
import { BadRequest } from '../response/error.response'
import { Upload } from '@aws-sdk/lib-storage'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
    region: process.env.AWS_REGION as string,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string 
    }
})

export const s3config = () => s3Client

export const uploadFile = async ({
    storageApproach = StorageEnum.memory,
    Bucket = process.env.AWS_BUCKET_NAME as string,
    ACL = "private",
    path = "general",
    file
}: {
    storageApproach?: StorageEnum
    Bucket?: string,
    ACL?: ObjectCannedACL,
    path?: string,
    file: Express.Multer.File
}): Promise<string> => {

    const command = new PutObjectCommand({
        Bucket,
        ACL,
        Key: `${process.env.APPLICATION_NAME}/${path}/${uuid()}_${file.originalname}`,
        Body: storageApproach === StorageEnum.memory ? file.buffer : createReadStream(file.path),
        ContentType: file.mimetype
    })

    await s3Client.send(command)

    if (!command?.input.Key) {
        throw new BadRequest("Failed to generate upload key")
    }

    return command.input.Key
}

export const uploadFiles = async ({
    storageApproach = StorageEnum.memory,
    Bucket = process.env.AWS_BUCKET_NAME as string,
    ACL = "private",
    path = "general",
    files,
    isLarge = false
}: {
    storageApproach?: StorageEnum
    Bucket?: string,
    ACL?: ObjectCannedACL,
    path?: string,
    files: Express.Multer.File[],
    isLarge?: boolean
}):Promise<string[]> => {
let urls:string[] = []
if(isLarge) {
urls = await Promise.all(files.map(file => {
    return uploadLargeFile({
            storageApproach ,
    Bucket ,
    ACL,
    path,
    file,})
}))
}
else {
   urls = await Promise.all(files.map(file => {
    return uploadFile({
            storageApproach ,
    Bucket ,
    ACL,
    path,
    file,})
})) 
}

return urls
}

export const uploadLargeFile = async ({
    storageApproach = StorageEnum.disk,
    Bucket = process.env.AWS_BUCKET_NAME,
    ACL = "private",
    path = "general",
    file
}: {
    storageApproach?: StorageEnum
    Bucket?: string,
    ACL?: ObjectCannedACL,
    path?: string,
    file: Express.Multer.File
}):Promise<string> => {
const upload = new Upload({
    client: s3config(),
    params: {
        Bucket,
        ACL,
        Key: `${process.env.APPLICATION_NAME}/${path}/${uuid()}_${file.originalname}`,
        Body: storageApproach === StorageEnum.memory ? file.buffer : createReadStream(file.path),
        ContentType: file.mimetype
    },
})
upload.on("httpUploadProgress", (progress) => {
console.log(progress);

})
const {Key}=await upload.done()

    if (!Key) {
        throw new BadRequest("Failed to generate upload key")
    }
return Key
}

export const createPreSignUploadLink = async({Bucket = process.env.AWS_BUCKET_NAME as string, expiresIn=120,path = "general", ContentType, originalname}:{
Bucket?:string,
path?:string,
expiresIn?: number
originalname:string,
ContentType:string
}):Promise<{url:string, key:string}> => {
    const command = new PutObjectCommand({
        Bucket,
        Key:`${process.env.APPLICATION_NAME}/${path}/${uuid()}_${originalname}`,
        ContentType
    })
const url = await getSignedUrl(s3config(), command, {expiresIn})
if(!url || !command.input?.Key) {
    throw new BadRequest("Failed to create pre-signed url")
}
return {url, key:command.input.Key}
}

export const createGetPreSignedLink = async({Bucket = process.env.AWS_BUCKET_NAME as string, expiresIn=120, Key, download="false", downloadName="dummy"}:{
Bucket?:string,
expiresIn?: number
Key:string,
download?:string,
downloadName?:string
}):Promise<string> => {
    const command = new GetObjectCommand({
        Bucket,
        Key,
        ResponseContentDisposition: download === "true" ? `attachments: filename="${downloadName || Key.split("/").pop()}"` : undefined
    })
const url = await getSignedUrl(s3config(), command, {expiresIn})
if(!url) {
    throw new BadRequest("Failed to create pre-signed url")
}
return url
}

export const getFile = async({Bucket=process.env.AWS_BUCKET_NAME as string, Key}:{Bucket?:string, Key:string}):Promise<GetObjectCommandOutput> => {
const command = new GetObjectCommand({
Bucket,
Key
})

return await s3Client.send(command)
}