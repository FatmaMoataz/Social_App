"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudFileUpload = exports.StorageEnum = void 0;
const multer_1 = __importDefault(require("multer"));
var StorageEnum;
(function (StorageEnum) {
    StorageEnum["memory"] = "memory";
    StorageEnum["disk"] = "disk";
})(StorageEnum || (exports.StorageEnum = StorageEnum = {}));
const cloudFileUpload = ({ storageApproach = StorageEnum.memory }) => {
    const storage = storageApproach === StorageEnum.memory ? multer_1.default.memoryStorage() : multer_1.default.diskStorage({});
    return (0, multer_1.default)({ storage });
};
exports.cloudFileUpload = cloudFileUpload;
