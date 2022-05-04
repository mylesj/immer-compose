import { enablePatches } from 'immer'
enablePatches()

import { composeWithPatches } from './composeWithPatches'

type Any = number | string
type Arbitrary = {
    [key in string]: Any | Any[] | Record<string, Any>
}

describe(composeWithPatches.name, () => {
    it('should return a thunk', () => {
        expect(composeWithPatches()).toEqual(expect.any(Function))
    })

    it('should return the original object when there are no tasks', async () => {
        const input = {}
        const [state] = await composeWithPatches()(input)
        expect(state).toBe(input)
    })

    it('should pass all arguments through to the composed tasks', async () => {
        const task = jest.fn()
        const input = {}
        await composeWithPatches(task)(input, 1, 2, 3)
        expect(task).toHaveBeenCalledWith(input, 1, 2, 3)
    })

    it('should not mutate the initial state', async () => {
        const initial = {}
        const reduce = composeWithPatches<Arbitrary>(() => (draft) => {
            draft.a = 1
        })
        const [newState] = await reduce(initial)
        expect(newState).not.toBe(initial)
    })

    it('should handle basic composition of functions', async () => {
        const reduce = composeWithPatches<Arbitrary>(() => (draft) => {
            draft.a = 1
        })
        const [state] = await reduce({})
        expect(state).toStrictEqual({
            a: 1,
        })
    })

    it('should skip over tasks that return undefined', async () => {
        const reduce = composeWithPatches<number[]>(
            () => (draft) => {
                draft.push(1)
            },
            () => undefined,
            () => (draft) => {
                draft.push(3)
            }
        )
        const [state] = await reduce([])
        expect(state).toStrictEqual([1, 3])
    })

    it('should handle composition of async functions', async () => {
        const reduce = composeWithPatches<Arbitrary>(async () => {
            await delay(100)
            return (draft) => {
                draft.a = 1
            }
        })

        const runner = reduce({})
        jest.runAllTimers()
        const [state] = await runner
        expect(state).toStrictEqual({
            a: 1,
        })
    })

    it('should always resolve new state in the order of composition', async () => {
        const reduce = composeWithPatches<number[]>(
            async () => {
                await delay(200)
                return (draft) => {
                    draft.push(1)
                }
            },
            async () => {
                await delay(300)
                return (draft) => {
                    draft.push(2)
                }
            },
            async () => {
                await delay(100)
                return (draft) => {
                    draft.push(3)
                }
            }
        )

        const runner = reduce([])
        jest.runAllTimers()
        const [state] = await runner
        expect(state).toStrictEqual([1, 2, 3])
    })

    it('should return updates as patches', async () => {
        const reduce = composeWithPatches<Arbitrary>(
            () => () => ({}),
            () => (draft) => {
                draft.test = 'test'
            },
            () => (draft) => {
                delete draft.test
            },
            () => (draft) => {
                draft.hello = 'world'
            }
        )
        const [, patches] = await reduce({ input: 1 })
        expect(patches).toStrictEqual([
            { op: 'replace', path: [], value: {} },
            { op: 'add', path: ['test'], value: 'test' },
            { op: 'remove', path: ['test'] },
            { op: 'add', path: ['hello'], value: 'world' },
        ])
    })

    it('should return updates with reversed patches', async () => {
        const reduce = composeWithPatches<Arbitrary>(
            () => () => ({}),
            () => (draft) => {
                draft.test = 'test'
            },
            () => (draft) => {
                delete draft.test
            },
            () => (draft) => {
                draft.hello = 'world'
            }
        )
        const [, , reversed] = await reduce({ input: 1 })
        expect(reversed).toStrictEqual([
            { op: 'replace', path: [], value: { input: 1 } },
            { op: 'remove', path: ['test'] },
            { op: 'add', path: ['test'], value: 'test' },
            { op: 'remove', path: ['hello'] },
        ])
    })

    it('should process thunk recipes eagerly', async () => {
        const createSignal = () => {
            let trigger: (v?: unknown) => void
            const step = new Promise((resolve) => {
                trigger = resolve
            })
            return [jest.fn(() => trigger()), step] as const
        }

        const [signal1, step1] = createSignal()
        const [signal2, step2] = createSignal()
        const [signal3, step3] = createSignal()

        const reduce = composeWithPatches<number[]>(
            async () => {
                await delay(50)
                return () => {
                    signal1()
                }
            },
            async () => {
                await delay(150)
                return () => {
                    signal2()
                }
            },
            async () => {
                await delay(250)
                return () => {
                    signal3()
                }
            }
        )

        reduce([])

        jest.advanceTimersByTime(100)
        await step1
        expect(signal1).toHaveBeenCalled()
        expect(signal2).not.toHaveBeenCalled()

        jest.advanceTimersByTime(100)
        await step2
        expect(signal2).toHaveBeenCalled()
        expect(signal3).not.toHaveBeenCalled()

        jest.advanceTimersByTime(100)
        await step3
        expect(signal3).toHaveBeenCalled()
    })
})
