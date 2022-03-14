import { PromiseSerialMiddleware } from "../interfaces/middleware";

export type ProgressHandler<T> = (value: number, index: number, result: T) => void
export const progressMiddleware = <T>(onProgress: ProgressHandler<T>) => {
    const middleware: PromiseSerialMiddleware<any> = () => {
        return {
            beforeUpdate: () => {
            },
            error: () => {
            },
            update: (event) => {
                onProgress((event.index + 1) / event.values.length,event.index, event.results[event.results.length - 1]);
            },
            updated: () => {
            },
            finished: () => {
            },
        }
    };

    return middleware;
};
