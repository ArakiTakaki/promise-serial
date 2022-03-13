import { debounce, eventPromise, call } from '../src/utils';

test('call test', async () => {
    const arg = 'result'
    const exampleCallTest = (bar: string) => bar;
    const result = call(exampleCallTest, arg);
    expect(result()).toBe(arg);
});

const waitFor = (time: number) => new Promise((resolve) => setTimeout(resolve, time));
test('debounce executed number', async () => {
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

describe('event promise test', () => {
    it('resolve', async () => {
        const answer = 10;
        const event = eventPromise<number>({
            timeout: 100,
        });
        setTimeout(() => {
            event.resolveEvent(answer);
        }, 10);
        const result = await event.promise;
        expect(result).toBe(answer);
    });

    it('reject', async () => {
        await expect(async () => {
            const answer = 10;
            const event = eventPromise<number>({
                timeout: 10,
            });
            setTimeout(() => {
                event.resolveEvent(answer);
            }, 100);
            await event.promise;
        }).rejects.toThrowError();
    });
});
