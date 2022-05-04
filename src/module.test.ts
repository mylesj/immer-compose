import { compose, composeWithPatches } from './module'

describe('module', () => {
    it('should export', () => {
        expect(compose).toEqual(expect.any(Function))
        expect(composeWithPatches).toEqual(expect.any(Function))
    })
})
