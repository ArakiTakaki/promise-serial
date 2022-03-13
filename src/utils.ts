
export const call = <T extends (...args: any[]) => any>(cb: T, ...data: Parameters<T>) => (): ReturnType<T> => cb(...data);

/**
 * イベントを呼び出し後、次のイベントまで指定した時間が経過するまではイベントを発生させない処理。
 * @param callback
 * @param wait (ms)
 */
export const debounce = <T extends (...args: any[]) => any>(func: T, wait: number = 500): (...args: Parameters<T>) => void => {
  let cancelToken: number;
  const callback = (...args: Parameters<T>) => {
    window.clearTimeout(cancelToken);
    cancelToken = window.setTimeout(() => {
      func(...args);
    }, wait);
  }
  return callback;
};
