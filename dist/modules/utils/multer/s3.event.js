"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Event = exports.S3_EVENTS = void 0;
exports.initS3EventListeners = initS3EventListeners;
exports.emitTrackProfileImgUpload = emitTrackProfileImgUpload;
const node_events_1 = require("node:events");
const s3_config_1 = require("./s3.config");
const repository_1 = require("../../../DB/repository");
const models_1 = require("../../../DB/models");
/** Event names supported by this emitter */
exports.S3_EVENTS = {
    TRACK_PROFILE_IMG_UPLOAD: 'trackProfileImgUpload',
};
/** Singleton emitter */
exports.s3Event = new node_events_1.EventEmitter({});
/** Utility: resolve wait time (ms) safely */
function resolveWaitMs(expiresIn) {
    if (typeof expiresIn === 'number' && isFinite(expiresIn) && expiresIn >= 0) {
        return expiresIn;
    }
    const envSec = Number(process.env.AWS_PRE_SIGNED_URL_EXPIRES_IN_SECONDS);
    const sec = Number.isFinite(envSec) && envSec > 0 ? envSec : 900; // default 15 min
    return sec * 1000;
}
/** Utility: tiny logger (replace with your logger if you have one) */
function log(level, msg, meta) {
    const base = { at: 's3.event', ...meta };
    // eslint-disable-next-line no-console
    console[level](`[${level.toUpperCase()}] ${msg} ${JSON.stringify(base)}`);
}
/**
 * Handler: verify that the newly uploaded temp image exists in S3.
 * If present -> unset tempProfileImg and delete oldKey.
 * If missing (NoSuchKey) -> restore old profileImg and unset tempProfileImg.
 */
async function handleTrackProfileImgUpload(data) {
    const userRepo = new repository_1.UserRepository(models_1.UserModel);
    const waitMs = resolveWaitMs(data.expiresIn);
    setTimeout(async () => {
        const meta = { userId: String(data.userId), key: data.key, oldKey: data.oldKey, requestId: data.requestId, waitMs };
        try {
            // Check if the new key exists (pre-signed URL should have been used by client by now)
            await (0, s3_config_1.getFile)({ Key: data.key });
            // Success path: finalize by removing tempProfileImg and deleting old object
            await userRepo.updateOne({
                filter: { _id: data.userId },
                update: { $unset: { tempProfileImg: 1 } },
            });
            try {
                await (0, s3_config_1.deleteFile)({ Key: data.oldKey });
            }
            catch (delErr) {
                log('warn', 'Failed to delete oldKey after successful verification', { ...meta, delErr: delErr?.message });
            }
            log('info', 'Profile image verified & finalized', meta);
        }
        catch (err) {
            // If the temp object wasn’t uploaded in time (NoSuchKey), revert gracefully
            if (err?.Code === 'NoSuchKey') {
                try {
                    await userRepo.updateOne({
                        filter: { _id: data.userId },
                        update: { profileImg: data.oldKey, $unset: { tempProfileImg: 1 } },
                    });
                    log('warn', 'Temp key missing; restored old profile image', meta);
                }
                catch (revertErr) {
                    log('error', 'Failed to revert user profile image after missing temp key', { ...meta, revertErr: revertErr?.message });
                }
            }
            else {
                log('error', 'Unexpected error during S3 verification', { ...meta, err: err?.message, code: err?.Code });
            }
        }
    }, waitMs);
}
/** Register listeners (idempotent) */
let listenersInitialized = false;
function initS3EventListeners() {
    if (listenersInitialized)
        return;
    exports.s3Event.on(exports.S3_EVENTS.TRACK_PROFILE_IMG_UPLOAD, handleTrackProfileImgUpload);
    listenersInitialized = true;
}
/** Convenience emitter for callers */
function emitTrackProfileImgUpload(payload) {
    initS3EventListeners();
    exports.s3Event.emit(exports.S3_EVENTS.TRACK_PROFILE_IMG_UPLOAD, payload);
}
