
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

  let rejectEvent: ((error: Error) => void) = () => {
    throw new Error('not defined event');
  };

  const promise = new Promise((resolve, reject) => {
    let isFinish = false;

    timeoverEvent.exec(() => {
      if (isFinish) return;
      const error = new Error('event promise is timeover');
      error.name = 'EventPromiseError';
      isFinish = true;
      reject(error);
    });
    resolveEvent = (value: T) => {
      if (isFinish) return;
      timeoverEvent.cancel();
      resolve(value);
      isFinish = true;
    };

    rejectEvent = (error: Error) => {
      if (isFinish) return;
      reject(error);
      isFinish = true;
    };
  });

  return {
    promise,
    resolveEvent,
    rejectEvent,
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
    }, wait);
  }
  return {
    exec: callback,
    cancel: () => {
      clearTimeout(cancelToken);
    }
  };
};
