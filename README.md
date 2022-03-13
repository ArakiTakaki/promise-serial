# promise-serial

## gentting satrted

- `npm install @araki-packages/promise-serial`
- `yarn add @araki-packages/promise-serial`

## usage

```ts
import { promiseSerial, CannceledError } from '@araki-packages/promise-serial';

const waitForPromise = async (wait: number, val: string): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(val);
        }, wait)
    });
};

const main = async () => {
    // キャンセル無
    const items = ['done 1', 'done 2', 'done 3', 'done 4'];
    const results = promiseSerial(items.map((val) => () => waitForPromise(100, val)));
    console.log(await results.value)
    // ['done 1', 'done 2', 'done 3', 'done 4']

    // キャンセル有
    try {
        const items = ['done 1', 'done 2', 'done 3', 'done 4'];
        const results = promiseSerial(items.map((val) => () => waitForPromise(100, val)));
        console.log(await waitForPromise(110, 'cancel'));
        results.cancel();
        console.log(await results.value)
    } catch (err) {
        if (err instanceof CannceledError) {
            console.error(err.results);
            // ['done1']
        }
    }
};

main();
```

