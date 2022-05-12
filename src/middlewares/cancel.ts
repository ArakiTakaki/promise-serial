import { CannceledError } from '../errors';
import { PromiseSerialMiddleware } from "../interfaces/middleware";
import { debounce } from '../utils';

export const cancelMiddleware = <T extends Promise<any[]>>(timeout: number = Infinity, isNotCanceledThrow: boolean = false) => {
    let isCancel = false;
    let process: T | null = null;

    const cancelableNotThrow = (target: T) => {
        return new Promise<Awaited<T>[]>((resolve, reject) => {
            target
                .then(resolve)
                .catch(err => {
                    if (err instanceof CannceledError) {
                        resolve(err.results)
                        return;
                    }
                    reject(err);
                    return;
                });
        });
    };

    const cancel = () => {
        isCancel = true
        if (process == null) throw new Error('not found process');
        return cancelableNotThrow(process);
    };

    const middleware: PromiseSerialMiddleware<T> = () => {
        const timeover = debounce((cb: Function) => {
            cb();
        }, timeout);

        return {
            beforeUpdate: (event) => {
                timeover.exec(() => {
                    cancel();
                });
            },
            error: () => {
                timeover.cancel();
            },
            update: (event) => {
                if (isCancel) {
                    event.throws(new CannceledError<T>(event.results));
                }
            },
            updated: () => {
            },
            finished: () => {
                timeover.cancel();
            },
            editResult: (event) => {
                process = event.process as any;
                if (!isNotCanceledThrow) return event.process;
                return cancelableNotThrow(event.process as any);
            },
        }
    };

    return {
        middleware,
        cancel,
    }
};
