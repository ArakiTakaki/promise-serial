export const call = <T extends (...args: any) => unknown>(cb: T, ...data: Parameters<T>) => () => cb.apply(data);
