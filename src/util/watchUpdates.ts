type Watched<T> = {
    id: number
    data?: T
    error?: true
}

export const watchUpdates = async function* <T>(
    promises: Promise<T>[]
): AsyncGenerator<T, void, void> {
    let todo = promises.map((promise, id) => ({
        id,
        promise: promise
            .then<Watched<T>>((data: T) => ({ id, data }))
            .catch<Watched<T>>(() => ({ id, error: true })),
    }))

    while (todo.length) {
        const { id, data, error } = await Promise.race(
            todo.map(({ promise }) => promise)
        )

        todo = todo.filter((item) => item.id !== id)

        if (error || data === undefined) {
            if (!todo.length) {
                return
            }
            continue
        }

        yield data
    }
}
