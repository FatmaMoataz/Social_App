"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFiles = exports.deleteFile = exports.getFile = exports.createGetPreSignedLink = exports.createPreSignUploadLink = exports.uploadLargeFile = exports.uploadFiles = exports.uploadFile = exports.s3config = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const uuid_1 = require("uuid");
const cloud_multer_1 = require("./cloud.multer");
const node_fs_1 = require("node:fs");
const error_response_1 = require("../response/error.response");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});
const s3config = () => s3Client;
exports.s3config = s3config;
const uploadFile = async ({ storageApproach = cloud_multer_1.StorageEnum.memory, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", path = "general", file }) => {
    const command = new client_s3_1.PutObjectCommand({
        Bucket,
        ACL,
        Key: `${process.env.APPLICATION_NAME}/${path}/${(0, uuid_1.v4)()}_${file.originalname}`,
        Body: storageApproach === cloud_multer_1.StorageEnum.memory ? file.buffer : (0, node_fs_1.createReadStream)(file.path),
        ContentType: file.mimetype
    });
    await s3Client.send(command);
    if (!command?.input.Key) {
        throw new error_response_1.BadRequest("Failed to generate upload key");
    }
    return command.input.Key;
};
exports.uploadFile = uploadFile;
const uploadFiles = async ({ storageApproach = cloud_multer_1.StorageEnum.memory, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", path = "general", files, isLarge = false }) => {
    let urls = [];
    if (isLarge) {
        urls = await Promise.all(files.map(file => {
            return (0, exports.uploadLargeFile)({
                storageApproach,
                Bucket,
                ACL,
                path,
                file,
            });
        }));
    }
    else {
        urls = await Promise.all(files.map(file => {
            return (0, exports.uploadFile)({
                storageApproach,
                Bucket,
                ACL,
                path,
                file,
            });
        }));
    }
    return urls;
};
exports.uploadFiles = uploadFiles;
const uploadLargeFile = async ({ storageApproach = cloud_multer_1.StorageEnum.disk, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", path = "general", file }) => {
    const upload = new lib_storage_1.Upload({
        client: (0, exports.s3config)(),
        params: {
            Bucket,
            ACL,
            Key: `${process.env.APPLICATION_NAME}/${path}/${(0, uuid_1.v4)()}_${file.originalname}`,
            Body: storageApproach === cloud_multer_1.StorageEnum.memory ? file.buffer : (0, node_fs_1.createReadStream)(file.path),
            ContentType: file.mimetype
        },
    });
    upload.on("httpUploadProgress", (progress) => {
        console.log(progress);
    });
    const { Key } = await upload.done();
    if (!Key) {
        throw new error_response_1.BadRequest("Failed to generate upload key");
    }
    return Key;
};
exports.uploadLargeFile = uploadLargeFile;
const createPreSignUploadLink = async ({ Bucket = process.env.AWS_BUCKET_NAME, expiresIn = 120, path = "general", ContentType, originalname }) => {
    const command = new client_s3_1.PutObjectCommand({
        Bucket,
        Key: `${process.env.APPLICATION_NAME}/${path}/${(0, uuid_1.v4)()}_${originalname}`,
        ContentType
    });
    const url = await (0, s3_request_presigner_1.getSignedUrl)((0, exports.s3config)(), command, { expiresIn });
    if (!url || !command.input?.Key) {
        throw new error_response_1.BadRequest("Failed to create pre-signed url");
    }
    return { url, key: command.input.Key };
};
exports.createPreSignUploadLink = createPreSignUploadLink;
const createGetPreSignedLink = async ({ Bucket = process.env.AWS_BUCKET_NAME, expiresIn = 120, Key, download = "false", downloadName = "dummy" }) => {
    const command = new client_s3_1.GetObjectCommand({
        Bucket,
        Key,
        ResponseContentDisposition: download === "true" ? `attachments: filename="${downloadName || Key.split("/").pop()}"` : undefined
    });
    const url = await (0, s3_request_presigner_1.getSignedUrl)((0, exports.s3config)(), command, { expiresIn });
    if (!url) {
        throw new error_response_1.BadRequest("Failed to create pre-signed url");
    }
    return url;
};
exports.createGetPreSignedLink = createGetPreSignedLink;
const getFile = async ({ Bucket = process.env.AWS_BUCKET_NAME, Key }) => {
    const command = new client_s3_1.GetObjectCommand({
        Bucket,
        Key
    });
    return await s3Client.send(command);
};
exports.getFile = getFile;
const deleteFile = async ({ Bucket = process.env.AWS_BUCKET_NAME, Key }) => {
    const command = new client_s3_1.DeleteObjectCommand({
        Bucket,
        Key
    });
    return await s3Client.send(command);
};
exports.deleteFile = deleteFile;
const deleteFiles = async ({ Bucket = process.env.AWS_BUCKET_NAME, urls, Quiet = false }) => {
    const Objects = urls.map(url => {
        return { Key: url };
    });
    const command = new client_s3_1.DeleteObjectsCommand({
        Bucket,
        Delete: {
            Objects,
            Quiet
        }
    });
    return await s3Client.send(command);
};
exports.deleteFiles = deleteFiles;
