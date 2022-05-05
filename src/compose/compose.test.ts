import { compose } from './compose'

type Any = number | string
type Arbitrary = {
    [key in string]: Any | Any[] | Record<string, Any>
}

describe(compose.name, () => {
    it('should return a thunk', () => {
        expect(compose()).toEqual(expect.any(Function))
    })

    it('should return the original object when there are no tasks', async () => {
        const input = {}
        expect(await compose()(input)).toBe(input)
    })

    it('should pass all arguments through to the composed tasks', async () => {
        const task = jest.fn()
        const input = {}
        await compose(task)(input, 1, 2, 3)
        expect(task).toHaveBeenCalledWith(input, 1, 2, 3)
    })

    it('should not mutate the initial state', async () => {
        const initial = {}
        const reduce = compose<Arbitrary>(() => (draft) => {
            draft.a = 1
        })
        const newState = await reduce(initial)
        expect(newState).not.toBe(initial)
    })

    it('should handle basic composition of functions', async () => {
        const reduce = compose<Arbitrary>(() => (draft) => {
            draft.a = 1
        })
        expect(await reduce({})).toStrictEqual({
            a: 1,
        })
    })

    it('pass the initial state to the higher order function', async () => {
        const reduce = compose<Arbitrary>((initial) => (draft) => {
            draft.a = 1 + Number(initial.a)
        })
        expect(await reduce({ a: 1 })).toStrictEqual({
            a: 2,
        })
    })

    it('the initial state should be immutable', async () => {
        const reduce = compose<Arbitrary>((initial) => {
            // eslint-disable-next-line
            tryCatch(() => ((initial as any).a = 10))
            return (draft) => {
                draft.a = 1 + Number(initial.a)
            }
        })
        expect(await reduce({ a: 1 })).toStrictEqual({
            a: 2,
        })
    })

    it('should skip over tasks that return undefined', async () => {
        const reduce = compose<number[]>(
            () => (draft) => {
                draft.push(1)
            },
            () => undefined,
            () => (draft) => {
                draft.push(3)
            }
        )
        expect(await reduce([])).toStrictEqual([1, 3])
    })

    it('should handle composition of async functions', async () => {
        const reduce = compose<Arbitrary>(async () => {
            await delay(100)
            return (draft) => {
                draft.a = 1
            }
        })

        const runner = reduce({})
        jest.runAllTimers()
        expect(await runner).toStrictEqual({
            a: 1,
        })
    })

    it('should always resolve new state in the order of composition', async () => {
        const reduce = compose<number[]>(
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
        expect(await runner).toStrictEqual([1, 2, 3])
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

        const reduce = compose<number[]>(
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

    it('should defer async recipes and resolve first-come-first-server', async () => {
        const reduce = compose<number[]>(
            async () => {
                await delay(1000)
                return (draft) => {
                    draft.push(1)
                }
            },
            async () => {
                await delay(100)
                return async (draft) => {
                    draft.push(2)
                }
            },
            async () => {
                await delay(500)
                return (draft) => {
                    draft.push(3)
                }
            }
        )

        const runner = reduce([])
        jest.runAllTimers()
        expect(await runner).toStrictEqual([1, 3, 2])
    })

    it('should return the initial state for unhandled exceptions', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => {
            /**/
        })

        const reduce = compose<number[]>(
            async () => {
                await delay(100)
                return (draft) => {
                    draft.push(1)
                }
            },
            async () => {
                throw new Error('err')
                return (draft) => {
                    draft.push(2)
                }
            }
        )

        const initial: number[] = []
        const runner = reduce(initial)
        jest.runAllTimers()
        expect(await runner).toBe(initial)
    })
})
