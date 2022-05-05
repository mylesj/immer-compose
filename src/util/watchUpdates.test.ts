import { watchUpdates } from './watchUpdates'

describe(watchUpdates.name, () => {
    const update = async (n: number, ms: number) => {
        await delay(ms)
        return n
    }
    const collect = async <T>(watch: AsyncGenerator<T>): Promise<T[]> => {
        const responses: T[] = []
        for await (const response of watch) {
            responses.push(response)
        }
        return responses
    }

    it('should return immediately for empty input', async () => {
        const result = await watchUpdates([]).next()
        expect(result).toStrictEqual({ done: true, value: undefined })
    })

    it('should yield the results of promises', async () => {
        const tasks = [Promise.resolve(1), Promise.resolve(2)]
        const watch = watchUpdates(tasks)
        const result = await collect(watch)
        expect(result).toStrictEqual([1, 2])
    })

    it('should yield results in the order fulfilled', async () => {
        const tasks = [update(1, 200), update(2, 300), update(3, 100)]
        const watch = watchUpdates(tasks)
        jest.runAllTimers()
        const result = await collect(watch)
        expect(result).toStrictEqual([3, 1, 2])
    })

    it('should handle rejected promises gracefully', async () => {
        const tasks = [
            (async () => {
                await update(1, 200)
                throw new Error('oops')
            })(),
            update(2, 300),
            update(3, 100),
        ]
        const watch = watchUpdates(tasks)
        jest.runAllTimers()
        const result = await collect(watch)
        expect(result).toStrictEqual([3, 2])
    })

    it('should return immediately if the last task is rejected', async () => {
        const tasks = [
            (async () => {
                await update(1, 200)
                throw new Error('oops')
            })(),
        ]
        const watch = watchUpdates(tasks)
        jest.runAllTimers()
        const result = await collect(watch)
        expect(result).toStrictEqual([])
    })

    it('should return immediately if the last task yields undefined', async () => {
        const tasks = [Promise.resolve(undefined)]
        const watch = watchUpdates(tasks)
        const result = await collect(watch)
        expect(result).toStrictEqual([])
    })

    it('should continue when a task yields undefined but is not last', async () => {
        const tasks = [Promise.resolve(undefined), Promise.resolve(1)]
        const watch = watchUpdates(tasks)
        const result = await collect(watch)
        expect(result).toStrictEqual([1])
    })

    it('should yield falsy values in the result set', async () => {
        const tasks = [
            Promise.resolve(0),
            Promise.resolve(''),
            Promise.resolve(null),
            Promise.resolve(false),
        ]
        const watch = watchUpdates<null | string | number | boolean>(tasks)
        const result = await collect(watch)
        expect(result).toStrictEqual([0, '', null, false])
    })
})
