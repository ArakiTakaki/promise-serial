import { promiseSerial, call } from '../src/main';

test('util test', async () => {
    const arg = 'result'
    const exampleCallTest = (bar: string) => bar;
    const result = call(exampleCallTest, arg);
    expect(result()).toBe(arg);
});

const waitForTest = (returnValue: string) => async (waitTime: number) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(returnValue);
        }, waitTime);
    });
};

test('promise serial test',async () => {
    const values = ['a', 'b', 'c', 'd', 'e', 'f'];
    const result = await promiseSerial(values.map(waitForTest).map((cb) => call(cb, Math.random() * 200)), {
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

test('promise serial timeout test', async () => {
    const values = ['a', 'b', 'c', 'd', 'e', 'f'];
    const result = promiseSerial(values.map(waitForTest).map((cb) => call(cb, Math.random() * 1000)), {
        timeout: 100,
    });
    await expect(result.value).rejects.toThrowError();
});
