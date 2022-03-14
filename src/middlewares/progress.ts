import { Middleware } from "../interfaces/middleware";

export type progressHandler<T> = (value: number, index: number, result: T) => void
export const progressMiddleware = <T>(onProgress: progressHandler<T>) => {
    const middleware: Middleware<any> = () => {
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