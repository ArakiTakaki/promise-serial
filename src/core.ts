import { CannceledError } from './errors';
import { debounce, eventPromise } from './utils';

interface PromiseSerialResult<T extends readonly unknown[] | []> {
    value: Promise<T>;
    cancel: () => Promise<T>;
}

// TODO 随時追加
interface PromiseSerialOptions<T> {
    onProgress?: (value: number, index: number, result: T) => void
    timeout?: number;
    isNotCancelledThrow?: boolean;
}

/**
 * Promiseを直列実行させるための関数
 * @param values 同期処理をするPromise群
 * @param options.onProgress 進行状況を返却するコールバックの定義
 * @param options.timeout 各イベントのタイムアウト期間 (初期値：50秒)
 * @param options.isNotCancelledThrow canncel時にthrowするかどうか
 * @returns result.value Promiseを返却
 * @returns result.cancel() 実行時にキャンセル
 * @returns result.progress() 現在の進捗 0-1
 */
export const promiseSerial = <T extends Promise<any>>(values: (() => T)[], {
    onProgress,
    timeout = 50000,
    isNotCancelledThrow = false,
}: PromiseSerialOptions<T> = {}): PromiseSerialResult<T[]> => {
    let isCancel = false;
    const results: T[] = [];
    const cancelledPromise = eventPromise<T[]>();
    cancelledPromise.promise.catch(() => {});

    const timeoverEvent = debounce(() => {
        isCancel = true;
    }, timeout);

    const main = async () => {
        for (let i = 0; i < values.length; i ++ ) {
            timeoverEvent.exec();

            try {
                const result = await values[i]();
                if (onProgress != null) onProgress((i + 1) / values.length, i, result);
                if (isCancel) {
                    cancelledPromise.resolveEvent(results);
                    timeoverEvent.cancel();
                    if (isNotCancelledThrow) return results;
                    throw new CannceledError<T>(results);
                }
                results.push(result);
            } catch (err) {
                throw err;
            }
        }

        cancelledPromise.cancel();
        timeoverEvent.cancel();
        return results;
    };

    return {
        value: main(),
        cancel: () => {
            isCancel = true;
            return cancelledPromise.promise;
        },
    };
}
