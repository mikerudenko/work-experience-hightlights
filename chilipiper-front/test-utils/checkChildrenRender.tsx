import React from 'react'
import { shallow } from 'enzyme'

type CheckChildrenRender = <P extends {}>(TestSubject: React.ComponentType<P>, props: P) => void

export const checkChildrenRender: CheckChildrenRender = (TestSubject, props) => {
    const Dummy = () => null

    const subject = shallow(
        <TestSubject {...props}>
            <Dummy />
        </TestSubject>
    )
    expect(subject.find(Dummy)).toHaveLength(1)
}
