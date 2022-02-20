import { promiseSerial } from '../src/main';

const waitForPromise = async (wait: number, val: string): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(val);
        }, wait)
    });
}

const main = async () => {
    {
        const results = promiseSerial([
            () => waitForPromise(100, 'done 1'),
            () => waitForPromise(100, 'done 2'),
            () => waitForPromise(100, 'done 3'),
            () => waitForPromise(100, 'done 4'),
        ])
        console.log(await results.value)
    }
    {
        try {
            const results = promiseSerial([
                () => waitForPromise(100, 'done 1'),
                () => waitForPromise(100, 'done 2'),
                () => waitForPromise(100, 'done 3'),
                () => waitForPromise(100, 'done 4'),
            ])
            console.log(await waitForPromise(110, 'cancel'));
            results.cancel();
            console.log(await results.value)
        } catch (err) {
            console.error(err);
        }
    }
}

main();
