import { Immutable } from 'immer'

import { AnyObject, AnyArray } from '~/types'

import { isObject } from './is'

export const immutable = <T extends AnyObject | AnyArray>(
    obj: T
): Immutable<T> => {
    const proxy = new Proxy(obj, {
        get(...args) {
            const target = Reflect.get(...args)
            return isObject(target) ? immutable(target) : target
        },
        set() {
            return false
        },
    })

    return (<unknown>proxy) as Immutable<T>
}
