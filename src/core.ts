import { CannceledError } from './errors';
import { Middleware } from './interfaces/middleware';
import { cancelMiddleware } from './middlewares/cancel';
import { progressMiddleware, progressHandler } from './middlewares/progress';
import { notNull } from './utils';

type Serializable<T extends readonly unknown[] | []> = Promise<T>;

const _promiseSerial = async <T extends Promise<any>>(values: (() => T)[], middlewares: Middleware<T>[] = []): Serializable<T[]> => {
    const _middleware = middlewares.map(value => value());

    const main = async () => {
        const results: T[] = [];

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
    return await _middleware.reduce((process, { editResult }) => {
        if (editResult == null) return process;
        return editResult({
            process: process,
        });
    }, process);
};


type PromiseSerialResult<T extends readonly unknown[] | []> = {
    value: Promise<T>;
    cancel: () => Promise<T>;
}

interface PromiseSerialOptions<T> {
    onProgress?: progressHandler<T>,
    timeout?: number;
    isNotCancelledThrow?: boolean;
}
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
    const cancellable = cancelMiddleware<T>(options.timeout, options.isNotCancelledThrow);
    const middlewares = [
        cancellable.middleware,
        options.onProgress != null ? progressMiddleware(options.onProgress) : undefined
    ].filter(notNull)

    const process = _promiseSerial<T>(values, middlewares);

    return {
        value: process,
        cancel: () => {
            cancellable.cancel();
            return process;
        }
    }
};
