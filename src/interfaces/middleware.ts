export interface ErrorEvent<T> {
    values: (() => Promise<T>)[];
    results: T[];
    errorObject: Error,
}
export type ErrorHandler<T> = (event: ErrorEvent<T>) => void;

export interface BeforeUpdateEvent <T>{
    values: (() => Promise<T>)[];
    results: T[];
    index: number;
    throws: (err: Error) => void;
}
export type BeforeUpdateHandler <T> = (event: BeforeUpdateEvent<T>) => void;

export interface UpdateEvent<T> {
    values: (() => Promise<T>)[];
    results: T[];
    index: number;
    throws: (err: Error) => void;
}
export type UpdateHandler<T> =(event: UpdateEvent<T>) => void;

export interface UpdatedEvent<T>{
    values: (() => Promise<T>)[];
    results: T[];
    index: number;
    throws: (err: Error) => void;
}
export type UpdatedHandler <T>= (event: UpdatedEvent<T>) => void;

export interface FinishedEvent<T> {
    results: T[];
}
export type FinishedHandler<T> = (event: FinishedEvent<T>) => void;

export interface EditResultEvent<T> {
    process: Promise<Awaited<T[]>>;
}
export type EditResultHandler = (event: EditResultEvent<any>) => Promise<any[]>;

export interface PromiseSerialMiddlewareHandlers<T> {
    error: ErrorHandler<T>;
    beforeUpdate: BeforeUpdateHandler<T>;
    update: UpdateHandler<T>;
    updated: UpdatedHandler<T>;
    finished: FinishedHandler<T>;
    editResult?: EditResultHandler;
};

export type PromiseSerialMiddleware<T> = () => PromiseSerialMiddlewareHandlers<T>;
