import { CannceledError } from '../errors';
import { Middleware } from "../interfaces/middleware";
import { debounce } from '../utils';

export const cancelMiddleware = <T>(timeout: number = Infinity) => {
    let isCancel = false;
    const cancel = () => {
        isCancel = true
    };
    const middleware: Middleware<T> = () => {
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
        }
    };

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


    return {
        middleware,
        cancel,
        cancellableNotThrow,
    }
};