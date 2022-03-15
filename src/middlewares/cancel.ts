import { CannceledError } from '../errors';
import { PromiseSerialMiddleware } from "../interfaces/middleware";
import { debounce } from '../utils';

export const cancelMiddleware = <T>(timeout: number = Infinity, isNotCancelledThrow: boolean = false) => {
    let isCancel = false;
    let process: Promise<T[]> | null = null;

    const cancellableNotThrow = (target: Promise<T[]>) => {
        return new Promise<T[]>((resolve, reject) => {
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
        return cancellableNotThrow(process);
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
                process = event.process;
                if (!isNotCancelledThrow) return event.process;
                return cancellableNotThrow(event.process);
            },
        }
    };

    return {
        middleware,
        cancel,
        cancellableNotThrow,
    }
};
