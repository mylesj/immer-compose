import { isObject, isFunction, isAsyncFunction } from './is'

const arrowFn = () => {
    /* noop */
}
const asyncArrowFn = async () => {
    /* noop */
}
function expressionFn() {
    /* noop */
}
async function asyncExpressionFn() {
    /* noop */
}

describe(isObject.name, () => {
    it.each`
        input        | expected
        ${undefined} | ${false}
        ${1}         | ${false}
        ${null}      | ${false}
        ${{}}        | ${true}
    `('should return $expected for $input', ({ input, expected }) => {
        expect(isObject(input)).toBe(expected)
    })
})

describe(isFunction.name, () => {
    it.each`
        input                | expected
        ${undefined}         | ${false}
        ${null}              | ${false}
        ${1}                 | ${false}
        ${{}}                | ${false}
        ${arrowFn}           | ${true}
        ${expressionFn}      | ${true}
        ${asyncArrowFn}      | ${true}
        ${asyncExpressionFn} | ${true}
    `('should return $expected for $input', ({ input, expected }) => {
        expect(isFunction(input)).toBe(expected)
    })
})

describe(isAsyncFunction.name, () => {
    it.each`
        input                | expected
        ${arrowFn}           | ${false}
        ${expressionFn}      | ${false}
        ${asyncArrowFn}      | ${true}
        ${asyncExpressionFn} | ${true}
    `('should return $expected for $input', ({ input, expected }) => {
        expect(isAsyncFunction(input)).toBe(expected)
    })
})
