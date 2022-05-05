import { resolveGracefully } from './promise'

describe(resolveGracefully.name, () => {
    it('should resolve a promise', async () => {
        const result = await resolveGracefully(Promise.resolve(1))
        expect(result).toBe(1)
    })

    it('should resolve arbitrary input', async () => {
        const result = await resolveGracefully(2)
        expect(result).toBe(2)
    })

    it('should log an error message on rejection', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => {
            /**/
        })
        const error = new Error('oops')
        await resolveGracefully(Promise.reject(error))
        expect(console.error).toHaveBeenCalledWith(error)
    })

    it('should always return an explicit error object for signaling', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => {
            /**/
        })
        const result = await resolveGracefully(Promise.reject('error'))
        expect(result).toEqual(expect.any(Error))
    })
})
