import { promiseSerial } from '../src/main';
import { call } from '../src/utils';

const waitForTest = (returnValue: string) => async (waitTime: number): Promise<string> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(returnValue);
        }, waitTime);
    });
};

describe('promise serial', () => {
    it('basic', async () => {
        const values = ['a', 'b', 'c', 'd', 'e', 'f'];
        const result = await promiseSerial(values.map(waitForTest).map((cb, index) => call(cb, 100 * index)), {
            onProgress: (progress, index) => {
                const progressValue = 1 / values.length;
                const containResult = new Array(values.length).fill(0).map((_, index) => {
                    return (index + 1) * progressValue;
                });
                expect(progress).toBeCloseTo(containResult[index]);
            },
        }).value;
        expect(result).toEqual(values);
    });

    it('timeout', (done) => {
        const main = async () => {
            const values = ['a', 'b', 'c', 'd', 'e', 'f'];
            const result = promiseSerial(values.map(waitForTest).map((cb, index) => call(cb, 100 * index)), {
                timeout: 200,
            });
            await expect(result.value).rejects.toThrowErrorMatchingSnapshot();
            done();
        }
        main();
    });

    it('cancel', (done) => {
        const exec = async () => {
            const values = ['a', 'b', 'c', 'd', 'e', 'f'];
            const result = promiseSerial(values.map(waitForTest).map((cb, index) => call(cb, 100 * index)), {
                timeout: Infinity,
            });
            setTimeout(() => {
                result.cancel();
            }, 200)
            await expect(result.value).rejects.toThrowErrorMatchingSnapshot();
            done();
        }
        exec();
    });

    it('Cancel not throw', async () => {
        const values = ['a', 'b', 'c', 'd', 'e', 'f'];
        const answer = ['a'];
        const result = promiseSerial(values.map(waitForTest).map((cb) => call(cb, 100)), {
            timeout: Infinity,
            isNotCanceledThrow: true,
        });

        setTimeout(() => {
            expect(result.cancel()).resolves.toEqual(answer);
        }, 120);

        await expect(result.value).resolves.toEqual(answer);
    });
});

describe('issue', () => {
    it('#17', async () => {
        const values = ['a', 'b', 'c', 'd', 'e', 'f'];
        const result = await promiseSerial(values.map(waitForTest).map((cb, index) => call(cb, 100 * index))).value;
        expect(typeof result[0]).toEqual('string');
    });
});