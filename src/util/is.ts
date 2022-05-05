export const isObject = (o: unknown): boolean =>
    o !== null && typeof o === 'object'

export const isFunction = (fn: unknown): boolean => typeof fn === 'function'

export const isAsyncFunction = (fn: unknown): boolean =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isFunction(fn) && (fn as any)[Symbol.toStringTag] === 'AsyncFunction'
