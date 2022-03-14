type Pocess<T> = Promise<T[]>

export type ErrorHandler<T> = (event: {
    values: (() => Promise<T>)[];
    results: T[];
    errorObject: Error,
}) => void;

export type BeforeUpdateHandler <T> = (event: {
    values: (() => Promise<T>)[];
    results: T[];
    index: number;
    throws: (err: Error) => void;
}) => void;

export type UpdateHandler<T> =(event: {
    values: (() => Promise<T>)[];
    results: T[];
    index: number;
    throws: (err: Error) => void;
}) => void;
export type UpdatedHandler <T>= (event: {
    values: (() => Promise<T>)[];
    results: T[];
    index: number;
    throws: (err: Error) => void;
}) => void;

export type FinishedHandler<T> = (event: {
    results: T[];
}) => void;

export type Handlers<T> = {
    error: ErrorHandler<T>,
    beforeUpdate: BeforeUpdateHandler<T>,
    update: UpdateHandler<T>,
    updated: UpdatedHandler<T>,
    finished: FinishedHandler<T>,
};

export type Middleware<T> = () => Handlers<T>;
