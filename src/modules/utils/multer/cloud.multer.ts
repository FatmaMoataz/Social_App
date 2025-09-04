import multer from "multer";

export enum StorageEnum {
memory = "memory",
disk = "disk"
}

export const cloudFileUpload = ({storageApproach=StorageEnum.memory}:{storageApproach?:StorageEnum}):multer.Multer => {
    const storage = storageApproach === StorageEnum.memory ?  multer.memoryStorage() : multer.diskStorage({})
    return multer({storage})
}