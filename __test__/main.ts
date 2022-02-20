import { promiseSerial, call } from '../src/main';

const waitForPromise = async (wait: number, val: string): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(val);
        }, wait)
    });
};

const main = async () => {
    {
        const items = ['done 1', 'done 2', 'done 3', 'done 4'];
        const results = promiseSerial(items.map((val) => () => waitForPromise(100, val)));
        console.log(await results.value)
    }
    {
        try {
            const items = ['done 1', 'done 2', 'done 3', 'done 4'];
            const results = promiseSerial(items.map((val) => call(waitForPromise, 10, val)));
            console.log(await waitForPromise(110, 'cancel'));
            results.cancel();
            console.log(await results.value)
        } catch (err) {
            console.error(err);
        }
    }
}

main();
