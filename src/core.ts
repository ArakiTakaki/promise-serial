import { CannceledError } from './errors';
import { Middleware } from './interfaces/middleware';
import { cancelMiddleware } from './middlewares/cancel';
import { progressMiddleware, progressHandler } from './middlewares/progress';
import { notNull } from './utils';

type PromiseSerialResult2<T extends readonly unknown[] | []> = Promise<T>;

type PromiseSerialResult<T extends readonly unknown[] | []> = {
    value: Promise<T>;
    cancel: () => Promise<T>;
}

// TODO 随時追加
interface PromiseSerialOptions<T> {
    onProgress?: progressHandler<T>,
    timeout?: number;
    isNotCancelledThrow?: boolean;
}
const _promiseSerial = <T extends Promise<any>>(values: (() => T)[], middlewares: Middleware<T>[] = []): PromiseSerialResult2<T[]> => {
    const main = async () => {
        const results: T[] = [];
        const _middleware = middlewares.map(value => value());

        const cancelProcess = (err: Error) => {
            _middleware.forEach((value) => value.error({
                values,
                results,
                errorObject: err,
            }));
            _middleware.forEach((value) => value.finished({
                results,
            }));
            
            if (err != null) throw new CannceledError<T>(results);
        }

        for (let i = 0; i < values.length; i ++ ) {
            // before updated
            _middleware.forEach(value => value.beforeUpdate({
                values: values,
                results: results,
                index: i,
                throws: cancelProcess,
            }));

            const result = await values[i]();
            // update
            _middleware.forEach(value => value.update({
                values: values,
                results: results,
                index: i,
                throws: cancelProcess,
            }));
            results.push(result);
            _middleware.forEach(value => value.updated({
                values: values,
                results: results,
                index: i,
                throws: cancelProcess,
            }));
        }
        _middleware.forEach(value => value.finished({
            results: results,
        }));
        return results;
    };
    const process = main()
    return process;
};

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
export const promiseSerial = <T extends Promise<any>>(values: (() => T)[], options: PromiseSerialOptions<T> = {}): PromiseSerialResult<T[]> => {
    const { isNotCancelledThrow } = options;
    const cancellable = cancelMiddleware<T>(options.timeout);

    const middlewares = [
        cancellable.middleware,
        options.onProgress != null ? progressMiddleware(options.onProgress) : undefined
    ].filter(notNull)

    const process = _promiseSerial<T>(values, middlewares);
    const targetValues = isNotCancelledThrow ? cancellable.cancellableNotThrow(process) : process;
    
    return {
        value: targetValues,
        cancel: () => {
            cancellable.cancel();
            return targetValues;
        }
    }
};
