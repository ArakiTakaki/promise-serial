import { CannceledError } from '../errors';
import { PromiseSerialMiddleware } from "../interfaces/middleware";
import { debounce } from '../utils';

export const cancelMiddleware = <T>(timeout: number = Infinity, isNotCanceledThrow: boolean = false) => {
    let isCancel = false;
    const cancel = () => {
        isCancel = true
    };

    const CancelableNotThrow = (target: Promise<T[]>) => {
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
                if (!isNotCanceledThrow) return event.process;
                return CancelableNotThrow(event.process);
            }
        }
    };



    return {
        middleware,
        cancel,
        CancelableNotThrow,
    }
};
