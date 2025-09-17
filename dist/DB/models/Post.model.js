"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = exports.AvailabilityEnum = exports.AllowCommentsEnum = void 0;
const mongoose_1 = require("mongoose");
var AllowCommentsEnum;
(function (AllowCommentsEnum) {
    AllowCommentsEnum["allow"] = "allow";
    AllowCommentsEnum["deny"] = "deny";
})(AllowCommentsEnum || (exports.AllowCommentsEnum = AllowCommentsEnum = {}));
var AvailabilityEnum;
(function (AvailabilityEnum) {
    AvailabilityEnum["public"] = "public";
    AvailabilityEnum["friends"] = "friends";
    AvailabilityEnum["onlyMe"] = "only-me";
})(AvailabilityEnum || (exports.AvailabilityEnum = AvailabilityEnum = {}));
const postSchema = new mongoose_1.Schema({
    content: { type: String, minLength: 2, maxlength: 50000, required: function () {
            return !this.attachments?.length;
        } },
    attachments: [String],
    assetsFolderId: { type: String, required: true },
    allowComments: { type: String, enum: AllowCommentsEnum, default: AllowCommentsEnum.allow },
    availability: { type: String, enum: AvailabilityEnum, default: AvailabilityEnum.public },
    likes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    tags: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    freezedAt: Date,
    freezedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    restoredAt: Date,
    restoredBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" }
}, {
    timestamps: true
});
exports.PostModel = mongoose_1.models.Post || (0, mongoose_1.model)("Post", postSchema);
