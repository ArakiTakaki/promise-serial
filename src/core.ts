import { CannceledError } from './errors';
import { debounce } from './utils';

interface PromiseSerialResult<T extends readonly unknown[] | []> {
    value: Promise<T>;
    cancel: () => void;
}

// TODO 随時追加
interface PromiseSerialOptions<T> {
    onProgress?: (value: number, index: number, result: T) => void
    timeout?: number;
}

/**
 * Promiseを直列実行させるための関数
 * @param values 同期処理をするPromise群
 * @param options.onProgress 進行状況を返却するコールバックの定義
 * @param options.timeout 各イベントのタイムアウト期間 (初期値：50秒)
 * @returns result.value Promiseを返却
 * @returns result.cancel() 実行時にキャンセル
 * @returns result.progress() 現在の進捗 0-1
 */
export const promiseSerial = <T extends Promise<any>>(values: (() => T)[], {
    onProgress,
    timeout = 50000,
}: PromiseSerialOptions<T> = {}): PromiseSerialResult<T[]> => {
    let isComplete = false;
    let isCancel = false;

    const results: T[] = [];
    const timeoverEvent = debounce(() => {
        if (isComplete) return;
        const error = new CannceledError<T>(results);
        error.message = 'promise is timeout';
        if (isCancel) throw error;
    }, timeout);

    const main = async () => {
        timeoverEvent();

        for (let i = 0; i < values.length; i ++ ) {
            try {
                const result = await values[i]();
                if (onProgress != null) onProgress((i + 1) / values.length, i, result);
                if (isCancel) throw new CannceledError<T>(results);
                results.push(result);
            } catch (err) {
                throw err;
            }
        }
        isComplete = true;
        return results;
    };

    return {
        value: main(),
        cancel: () => {
            isCancel = true;
        },
    };
}
