import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { configure as configureTestingLib } from '@testing-library/react'

configure({
    adapter: new Adapter(),
    disableLifecycleMethods: true,
})

global.fetch = require('jest-fetch-mock')

configureTestingLib({ testIdAttribute: 'data-test-id' })

jest.mock('react-relative-portal')

// FIXME Remove when we upgrade to React >= 16.9
const originalConsoleError = console.error // eslint-disable-line no-console
// eslint-disable-next-line no-console
console.error = (...args) => {
    if (/Warning.*not wrapped in act/.test(args[0])) {
        return
    }
    originalConsoleError(...args)
}
