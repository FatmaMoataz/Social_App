"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.ProviderEnum = exports.RoleEnum = exports.GenderEnum = void 0;
const mongoose_1 = require("mongoose");
var GenderEnum;
(function (GenderEnum) {
    GenderEnum["male"] = "male";
    GenderEnum["female"] = "female";
})(GenderEnum || (exports.GenderEnum = GenderEnum = {}));
var RoleEnum;
(function (RoleEnum) {
    RoleEnum["user"] = "user";
    RoleEnum["admin"] = "admin";
})(RoleEnum || (exports.RoleEnum = RoleEnum = {}));
var ProviderEnum;
(function (ProviderEnum) {
    ProviderEnum["GOOGLE"] = "GOOGLE";
    ProviderEnum["SYSTEM"] = "SYSTEM";
})(ProviderEnum || (exports.ProviderEnum = ProviderEnum = {}));
const userSchema = new mongoose_1.Schema({
    firstname: { type: String, required: true, minLength: 2, maxLength: 25 },
    lastname: { type: String, required: true, minLength: 2, maxLength: 25 },
    email: { type: String, required: true, unique: true },
    confirmEmailOtp: { type: String },
    confirmedAt: { type: Date },
    profileImg: { type: String },
    coverImgs: { type: String },
    password: { type: String, required: function () {
            return this.provider === ProviderEnum.GOOGLE ? false : true;
        } },
    resetPasswordOtp: { type: String },
    changeCredentialsTime: { type: Date },
    phone: { type: String },
    address: { type: String },
    gender: { type: String, enum: GenderEnum, default: GenderEnum.male },
    role: { type: String, enum: RoleEnum, default: RoleEnum.user },
    provider: { type: String, enum: ProviderEnum, default: ProviderEnum.SYSTEM },
    updatedAt: { type: Date },
    createdAt: { type: Date }
}, { timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
userSchema.virtual("username").set(function (value) {
    const [firstname, lastname] = value.split(' ') || [];
    this.set({ firstname, lastname });
}).get(function () {
    return this.firstname + " " + this.lastname;
});
exports.UserModel = mongoose_1.models.User || (0, mongoose_1.model)("User", userSchema);
