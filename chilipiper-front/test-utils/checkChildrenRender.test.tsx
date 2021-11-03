import React from 'react'
import { checkChildrenRender } from './checkChildrenRender'

describe('test-utils', () => {
    describe('checkChildrenRender', () => {
        it('should pass if component renders its children', () => {
            expect(() => {
                const Foo: React.FunctionComponent = ({ children }) => <>{children}</>
                const props = {}

                checkChildrenRender(Foo, props)
            }).not.toThrow()
        })

        it('should fail if component does not render its children', () => {
            expect(() => {
                const Foo: React.FunctionComponent = () => <></>
                const props = {}

                checkChildrenRender(Foo, props)
            }).toThrowErrorMatchingSnapshot()
        })
    })
})
