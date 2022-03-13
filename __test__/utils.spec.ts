import { debounce } from '../src/utils';


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
