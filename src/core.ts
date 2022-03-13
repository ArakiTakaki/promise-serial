import { CannceledError } from './errors';

interface PromiseSerialResult<T extends readonly unknown[] | []> {
    value: Promise<T>;
    cancel: () => void;
}

// TODO 随時追加
interface PromiseSerialOptions<T> {
    onProgress?: (value: number, index: number, result: T) => void
}

/**
 * Promiseを直列実行させるための関数
 * @param values 同期処理をするPromise群
 * @param options.onProgress 進行状況を返却するコールバックの定義
 * @returns result.value Promiseを返却
 * @returns result.cancel() 実行時にキャンセル
 * @returns result.progress() 現在の進捗 0-1
 */
export const promiseSerial = <T extends Promise<any>>(values: (() => T)[], {
    onProgress
}: PromiseSerialOptions<T> = {}): PromiseSerialResult<T[]> => {
    let isCancel = false;

    const main = async () => {
        const results: T[] = [];
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
        return results;
    };

    return {
        value: main(),
        cancel: () => {
            isCancel = true;
        },
    };
}
