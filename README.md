# promise-serial

## 概要

Promiseを直列で実行する方法を提供します。

### 仕様

Middlewareで制御しており、処理を柔軟に追加する事が可能です。

自分で制作する場合は `src/middlewares` を参考にしてください。

下記にライフサイクルを記述します。

#### 実行順

1. initialize
2. execute(下記を1プロミスおきに実施)
    1. beforeUpdate
    2. update
    3. updated
3. finished
4. editResult

### initialize

初期化関数

フィールド定義等に使用
### beforeUpdate

対象となるPromiseを発火させる前に実施される。

### update

対象となるPromiseを発火し終わった後に実施される。（Resultには反映されていません）

### updated

対象となるPromiseを発火し終わった後に実施される。（Resultには反映された後です）
### finished

全ての処理が終了したタイミングにエラーが起きようが起きなかろうが実施される。

### error

Throwされたタイミングに実施

### editResult

PromiseSerialの結果が搬入される。

## getting started

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

