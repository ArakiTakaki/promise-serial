import { serializer } from './core';
import { PromiseSerialMiddleware } from './main';
import { cancelMiddleware } from './middlewares/cancel';
import { ProgressHandler, progressMiddleware } from './middlewares/progress';
import { notNull } from './utils';

export type PromiseSerialValue<T> = (() => T)[];
export interface PromiseSerialResult<T extends readonly unknown[] | []> {
    value: Promise<T>;
    cancel: () => Promise<T>;
}

export interface PromiseSerialOptions<T> {
    onProgress?: ProgressHandler<T>,
    timeout?: number;
    isNotCancelledThrow?: boolean;
    middlewares?: PromiseSerialMiddleware<T>[];
}

export type PromiseSerialHandler<T extends Promise<any>> = (values: PromiseSerialValue<T>, options: PromiseSerialOptions<T>) => PromiseSerialResult<T>;

/**
 * Promiseを直列実行させるための関数
 * @param values 同期処理をするPromise群
 * @param options.onProgress 進行状況を返却するコールバックの定義
 * @param options.timeout 各イベントのタイムアウト期間 (初期値：無限)
 * @param options.isNotCancelledThrow canncel時にthrowするかどうか
 * @returns result.value Promiseを返却
 * @returns result.cancel() 実行時にキャンセル
 * @returns result.progress() 現在の進捗 0-1
 */
export const promiseSerial = <T extends Promise<any>>(values: PromiseSerialValue<T>, options: PromiseSerialOptions<T> = {}): PromiseSerialResult<T[]> => {
    const cancellable = cancelMiddleware<T>(options.timeout, options.isNotCancelledThrow);
    const middlewares = [
        cancellable.middleware,
        options.onProgress != null ? progressMiddleware(options.onProgress) : undefined,
        ...(options.middlewares || []),
    ].filter(notNull)

    const process = serializer<T>(values, middlewares);

    return {
        value: process,
        cancel: () => {
            cancellable.cancel();
            return process;
        }
    }
};
