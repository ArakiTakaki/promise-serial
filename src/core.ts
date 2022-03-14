import { CannceledError } from './errors';
import { PromiseSerialMiddleware } from './interfaces/middleware';

type Serializable<T extends readonly unknown[] | []> = Promise<T>;

export const serializer = async <T extends Promise<any>>(values: (() => T)[], middlewares: PromiseSerialMiddleware<T>[] = []): Serializable<T[]> => {
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