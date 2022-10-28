import functions from 'firebase-functions';
import type { CallableContext } from 'firebase-functions/v1/https';

export type OnCallHandler<T> = (data: T, context: CallableContext) => Promise<unknown>;

export function guard<T>(handler: OnCallHandler<T>) {
  return async (data: T, context: CallableContext) => {
    if (!context.auth?.uid) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You are not authorized to call this function'
      );
    }
    return await handler(data, context);
  };
}
