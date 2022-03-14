import { MAX_TIMEOUT_NUMBER } from './constants';

export const call = <T extends (...args: any[]) => any>(cb: T, ...data: Parameters<T>) => (): ReturnType<T> => cb(...data);

export const notNull = <T>(item: T | null | undefined): item is T => {
    return item != null;
}

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
