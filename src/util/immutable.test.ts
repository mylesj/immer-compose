import { AnyObject, AnyArray } from '~/types'

import { immutable } from './immutable'

type Any = AnyObject | AnyArray
type Writeable<T> = { -readonly [P in keyof T]: T[P] }

describe(immutable.name, () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wrap = <T extends Any>(o: T): Writeable<T> => <any>immutable(o)
    const tryCatch = (fn: () => void) => {
        try {
            fn()
        } catch (e) {
            // not sure where the type-guard is coming from?
        }
    }

    it('should render object assignment inert', () => {
        const input = {
            a: 1,
            b: {},
        }
        const guarded = wrap(input)

        tryCatch(() => {
            guarded.a = 1
        })
        tryCatch(() => {
            guarded.b = { v: 1 }
        })

        expect(input).toStrictEqual({
            a: 1,
            b: {},
        })
    })

    it('should render array assignment inert', () => {
        const input = [1, { v: 2 }]
        const guarded = wrap(input)

        tryCatch(() => {
            guarded[0] = 2
        })
        tryCatch(() => {
            guarded.push(3)
        })

        expect(input).toStrictEqual([1, { v: 2 }])
    })

    it('should render deep assignment inert', () => {
        const input = {
            a: { foo: 1 },
            b: [{ bar: [2] }],
        }
        const guarded = wrap(input)

        tryCatch(() => {
            guarded.a.foo = 10
        })
        tryCatch(() => {
            guarded.b[0].bar[0] = 20
        })
        tryCatch(() => {
            guarded.b[0].bar.push(30)
        })

        expect(input).toStrictEqual({
            a: { foo: 1 },
            b: [{ bar: [2] }],
        })
    })

    it('should be traversable and readable', () => {
        const input = {
            a: 1,
            b: { v: 2 },
            c: [1, 2, 3],
        }
        const guarded = wrap(input)

        expect({
            a: guarded.a,
            b: { v: guarded.b.v },
            c: guarded.c.slice(0, 2).concat(guarded.c[2]),
        }).toStrictEqual(input)
    })
})
