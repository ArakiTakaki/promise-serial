import { promiseSerial, call } from '../src/main';

test('util test', async () => {
    const arg = 'result'
    const exampleCallTest = (bar: string) => bar;
    const result = call(exampleCallTest, arg);
    expect(result()).toBe(arg);
});

test('promise serial test',async () => {

    const waitForTest = (returnValue: string) => async (waitTime: number) => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(returnValue);
            }, waitTime);
        });
    };

    const values = ['a', 'b', 'c', 'd', 'e', 'f'];
    const result = await promiseSerial(values.map(waitForTest).map((cb) => call(cb, Math.random() * 200))).value;
    expect(result).toEqual(values);
});
