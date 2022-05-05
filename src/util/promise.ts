export const resolveGracefully = <T>(maybePromise: T): Promise<T | Error> =>
    Promise.resolve(maybePromise).catch((err) => {
        console.error(err)
        return new Error('__SIGNAL__')
    })
