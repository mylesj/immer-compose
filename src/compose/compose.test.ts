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

    it('should handle basic composition of regular functions', async () => {
        const reduce = compose<Arbitrary>(() => (draft) => {
            draft.a = 1
        })
        expect(await reduce({})).toStrictEqual({
            a: 1,
        })
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
})
