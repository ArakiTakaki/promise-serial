import { debounce, call } from '../src/utils';

test('call test', async () => {
    const arg = 'result'
    const exampleCallTest = (bar: string) => bar;
    const result = call(exampleCallTest, arg);
    expect(result()).toBe(arg);
});

const waitFor = (time: number) => new Promise((resolve) => setTimeout(resolve, time));
describe('debounce', () => {
    test('basic', async () => {
        let count = 0;
        const exec = debounce(() => {
            count ++;
        }, 100);
        exec.exec();
        exec.exec();
        exec.exec();
        exec.exec();
        exec.exec();
        await waitFor(110);
        exec.exec();
        await waitFor(110);
        expect(count).toBe(2);
    });

    test('infinity', async () => {
        let count = 0;
        const execDebounce = debounce(() => {
            count ++;
        }, Infinity);
        setTimeout(() => {
            execDebounce.cancel();
            expect(count).toBe(0);
        });
        execDebounce.exec();
    });
});
