import { isFunction } from './is'

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
