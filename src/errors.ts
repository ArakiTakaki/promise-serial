export class CannceledError<T extends any> extends Error {
    public name: string = 'CannceledError';
    public message: string = [
        'Canceled the operation of promiseSerial.',
        'The result in the middle is stored in "error.result".',
    ].join('\n');
    public stack?: string;
    public results: T[] = [];

    constructor(results: T[]) {
        super();
        this.results = results;
    }
}
