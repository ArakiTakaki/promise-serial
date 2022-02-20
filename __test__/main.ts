import { promiseSerial } from '../src/main';

const waitForString = async (wait: number): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('bar')
        }, wait)
    });
}

const main = async () => {
    const results = promiseSerial([
        waitForString(100),
        waitForString(100),
        waitForString(100),
    ])
    console.log(await results.value);
}

main();
