"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.ProviderEnum = exports.RoleEnum = exports.GenderEnum = void 0;
const mongoose_1 = require("mongoose");
const hash_security_1 = require("../../modules/utils/security/hash.security");
const email_event_1 = require("../../modules/utils/email/email.event");
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
    slug: { type: String, required: true, minLength: 2, maxLength: 50 },
    email: { type: String, required: true, unique: true },
    confirmEmailOtp: { type: String },
    confirmedAt: { type: Date },
    profileImg: { type: String },
    tempProfileImg: { type: String },
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
    createdAt: { type: Date },
    freezedAt: { type: Date },
    freezedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    restoredAt: { type: Date },
    restoredBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
userSchema.virtual("username").set(function (value) {
    const [firstname, lastname] = value.split(' ') || [];
    this.set({ firstname, lastname, slug: value.replaceAll(/\s+/g, "-") });
}).get(function () {
    return this.firstname + " " + this.lastname;
});
userSchema.pre("save", async function (next) {
    this.wasNew = this.isNew;
    if (this.isModified("password")) {
        this.password = await (0, hash_security_1.generateHash)(this.password);
    }
    if (this.isModified("confirmEmailOtp")) {
        this.confirmEmailPlainOtp = this.confirmEmailOtp;
        this.confirmEmailOtp = await (0, hash_security_1.generateHash)(this.confirmEmailOtp);
    }
    next();
});
userSchema.post("save", async function (doc, next) {
    const that = this;
    if (that.wasNew && that.confirmEmailPlainOtp) {
        email_event_1.emailEvent.emit("confirmEmail", { to: this.email, otp: that.confirmEmailPlainOtp });
    }
    next();
});
exports.UserModel = mongoose_1.models.User || (0, mongoose_1.model)("User", userSchema);
