/**
 * Promiseを直列実行させるための関数
 * @param values 同期処理をするPromise群
 * @returns result.value Promiseを返却
 * @returns result.cancel() 実行時にキャンセル
 * @returns result.progress() 現在の進捗 0-1
 */

interface PromiseSerialResult<T extends readonly unknown[] | []> {
    value: Promise<{ -readonly [P in keyof T]: Awaited<T[P]> }>;
    cancel: () => void;
}

// TODO 随時追加
interface PromiseSerialOptions {
}

export const promiseSerial = <T extends readonly unknown[] | []>(values: T, {
}: PromiseSerialOptions = {}): PromiseSerialResult<T> => {
    let isCancel = false;

    const main = async () => {
        const results: any[] = [];
        for (let i = 0; i < values.length; i ++ ) {
            // TODO Errorオブジェクトの中身にResultを入れる。
            if (isCancel) throw new Error('canceled');
            try {
                const result = await values[i];
                results.push(result);
            } catch (err) {
                throw err;
            }
        }
        return results as any;
    }

    return {
        value: main(),
        cancel: () => {
            isCancel = true;
        },
    };
}