import { AnyObject, AnyArray, AnyFunction } from '~/types'

export const isObject = (o: unknown): o is AnyObject | AnyArray =>
    o !== null && typeof o === 'object'

export const isFunction = (fn: unknown): fn is AnyFunction =>
    typeof fn === 'function'

export const isAsyncFunction = (fn: unknown): fn is () => unknown =>
    isFunction(fn) && fn[Symbol.toStringTag] === 'AsyncFunction'
