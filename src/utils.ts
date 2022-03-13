import { MAX_TIMEOUT_NUMBER } from './constants';

export const call = <T extends (...args: any[]) => any>(cb: T, ...data: Parameters<T>) => (): ReturnType<T> => cb(...data);

interface EventPromiseOption {
  timeout?: number;
}

export const eventPromise = <T>({
  timeout = 500000,
}: EventPromiseOption = {}) => {

  const timeoverEvent = debounce((cb: Function) => {
    cb();
  }, timeout);

  let resolveEvent: ((value: T) => void) = () => {
    throw new Error('not defined event');
  };

  let rejectEvent: ((error?: Error) => void) = () => {
    throw new Error('not defined event');
  };

  const promise = new Promise<T>((resolve, reject) => {
    let isFinish = false;

    timeoverEvent.exec(() => {
      if (isFinish) return;
      isFinish = true;

      const error = new Error('event promise is timeover');
      error.name = 'EventPromiseError';
      reject(error);
    });

    resolveEvent = (value: T) => {
      if (isFinish) return;
      isFinish = true;
      timeoverEvent.cancel();

      resolve(value);
    };

    rejectEvent = (error?: Error) => {
      if (isFinish) return;
      isFinish = true;
      timeoverEvent.cancel();

      reject(error);
    };
  });

  return {
    promise,
    resolveEvent,
    rejectEvent,
    cancel: (error: Error = new Error('not thowr')) => rejectEvent(error),
  };
};

/**
 * イベントを呼び出し後、次のイベントまで指定した時間が経過するまではイベントを発生させない処理。
 * @param callback
 * @param wait (ms)
 */
export const debounce = <T extends (...args: any[]) => any>(func: T, wait: number = 500): {
  exec: (...args: Parameters<T>) => void,
  cancel: () => void,
} => {
  let cancelToken: NodeJS.Timeout;
  const callback = (...args: Parameters<T>) => {
    clearTimeout(cancelToken);
    cancelToken = setTimeout(() => {
      func(...args);
    }, Math.min(wait, MAX_TIMEOUT_NUMBER));
  }
  return {
    exec: callback,
    cancel: () => {
      clearTimeout(cancelToken);
    }
  };
};
