import {
    getNumberFromValidatedMoneyValue,
    validateEmail,
    validateEmptyMarkup,
    validateMoney,
} from '../validation'

describe('validateMoney', () => {
    const expectedError = 'Should be a correct money value, e.g. 10,000.52'

    it.each`
        value           | expected
        ${'123'}        | ${undefined}
        ${'123.00'}     | ${undefined}
        ${'123.5'}      | ${undefined}
        ${'123.53'}     | ${undefined}
        ${'$123.53'}    | ${undefined}
        ${'123,123.53'} | ${undefined}
        ${'123.53s'}    | ${expectedError}
        ${'123,53s'}    | ${expectedError}
        ${'a'}          | ${expectedError}
    `('for value=$value return $expected', ({ value, expected }) => {
        expect(validateMoney(value)).toEqual(expected)
    })
})

describe('getNumberFromValidatedMoneyValue', () => {
    it.each`
        value           | expected
        ${'123'}        | ${123}
        ${'123.00'}     | ${123}
        ${'123.5'}      | ${123.5}
        ${'123.53'}     | ${123.53}
        ${'$123.53'}    | ${123.53}
        ${'123,123.53'} | ${123123.53}
    `('for value=$value return $expected', ({ value, expected }) => {
        expect(getNumberFromValidatedMoneyValue(value)).toEqual(expected)
    })
})

describe('validateEmail', () => {
    const error = 'Should be valid email'
    it.each`
        value              | expected
        ${'alex@alex.com'} | ${undefined}
        ${'alex'}          | ${error}
    `('for value=$value return $expected', ({ value, expected }) => {
        expect(validateEmail(value)).toEqual(expected)
    })
})

describe('validateEmptyMarkup', () => {
    const error = 'Should not be empty'
    it.each`
        value                                  | expected
        ${'<p><br/></p>'}                      | ${error}
        ${''}                                  | ${error}
        ${'<p><br/>  </p>'}                    | ${error}
        ${'<p><br/><br/><br/><br/>      </p>'} | ${error}
        ${'<p><strong>123</strong></p>'}       | ${undefined}
    `('for value=$value return $expected', ({ value, expected }) => {
        expect(validateEmptyMarkup(value)).toEqual(expected)
    })
})
