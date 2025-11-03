import { EventEmitter } from 'node:events';
import { deleteFile, getFile } from './s3.config';
import { UserRepository } from '../../../DB/repository';
import { UserModel } from '../../../DB/models';
import type { Types } from 'mongoose';

/** Event names supported by this emitter */
export const S3_EVENTS = {
  TRACK_PROFILE_IMG_UPLOAD: 'trackProfileImgUpload',
} as const;

export interface TrackProfileImgUploadPayload {
  userId: Types.ObjectId | string;
  /** Newly uploaded object key (the temp one to be verified) */
  key: string;
  /** Previously active key to delete on success (or fallback to on failure) */
  oldKey: string;
  /**
   * Delay before verification (ms). If not provided, we use
   * AWS_PRE_SIGNED_URL_EXPIRES_IN_SECONDS * 1000 (default 900s).
   */
  expiresIn?: number;
  /** Optional request id / correlation id for logs */
  requestId?: string;
}

/** Singleton emitter */
export const s3Event = new EventEmitter({});

/** Utility: resolve wait time (ms) safely */
function resolveWaitMs(expiresIn?: number): number {
  if (typeof expiresIn === 'number' && isFinite(expiresIn) && expiresIn >= 0) {
    return expiresIn;
  }
  const envSec = Number(process.env.AWS_PRE_SIGNED_URL_EXPIRES_IN_SECONDS);
  const sec = Number.isFinite(envSec) && envSec > 0 ? envSec : 900; // default 15 min
  return sec * 1000;
}

/** Utility: tiny logger (replace with your logger if you have one) */
function log(level: 'info' | 'warn' | 'error', msg: string, meta?: Record<string, unknown>) {
  const base = { at: 's3.event', ...meta };
  // eslint-disable-next-line no-console
  console[level](`[${level.toUpperCase()}] ${msg} ${JSON.stringify(base)}`);
}

/**
 * Handler: verify that the newly uploaded temp image exists in S3.
 * If present -> unset tempProfileImg and delete oldKey.
 * If missing (NoSuchKey) -> restore old profileImg and unset tempProfileImg.
 */
async function handleTrackProfileImgUpload(data: TrackProfileImgUploadPayload) {
  const userRepo = new UserRepository(UserModel);
  const waitMs = resolveWaitMs(data.expiresIn);

  setTimeout(async () => {
    const meta = { userId: String(data.userId), key: data.key, oldKey: data.oldKey, requestId: data.requestId, waitMs };

    try {
      // Check if the new key exists (pre-signed URL should have been used by client by now)
      await getFile({ Key: data.key });

      // Success path: finalize by removing tempProfileImg and deleting old object
      await userRepo.updateOne({
        filter: { _id: data.userId as any },
        update: { $unset: { tempProfileImg: 1 } },
      });

      try {
        await deleteFile({ Key: data.oldKey });
      } catch (delErr) {
        log('warn', 'Failed to delete oldKey after successful verification', { ...meta, delErr: (delErr as Error)?.message });
      }

      log('info', 'Profile image verified & finalized', meta);
    } catch (err: any) {
      // If the temp object wasn’t uploaded in time (NoSuchKey), revert gracefully
      if (err?.Code === 'NoSuchKey') {
        try {
          await userRepo.updateOne({
            filter: { _id: data.userId },
            update: { profileImg: data.oldKey, $unset: { tempProfileImg: 1 } },
          });
          log('warn', 'Temp key missing; restored old profile image', meta);
        } catch (revertErr) {
          log('error', 'Failed to revert user profile image after missing temp key', { ...meta, revertErr: (revertErr as Error)?.message });
        }
      } else {
        log('error', 'Unexpected error during S3 verification', { ...meta, err: err?.message, code: err?.Code });
      }
    }
  }, waitMs);
}

/** Register listeners (idempotent) */
let listenersInitialized = false;
export function initS3EventListeners() {
  if (listenersInitialized) return;
  s3Event.on(S3_EVENTS.TRACK_PROFILE_IMG_UPLOAD, handleTrackProfileImgUpload);
  listenersInitialized = true;
}

/** Convenience emitter for callers */
export function emitTrackProfileImgUpload(payload: TrackProfileImgUploadPayload) {
  initS3EventListeners();
  s3Event.emit(S3_EVENTS.TRACK_PROFILE_IMG_UPLOAD, payload);
}
