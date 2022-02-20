import { promiseSerial } from '../src/main';


const waitForPromise = async (wait: number, val: string): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(val);
        }, wait)
    });
};

const call = <T extends (...args: any) => unknown>(cb: T, ...data: Parameters<T>) => {
    return () => cb.apply(data);
}

function map<T, K>(arr: T[], cb: (data: T, index: number) => Promise<K>) {
  return arr.map((value: T, index: number) => () => {
    return cb(value, index);
  });
}

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
