import React from 'react'
import * as ReactDOM from 'react-dom'

let modalRoot = document.getElementById('react-root-portal')

export class RootPortal extends React.Component {
    el = document.createElement('div')

    modalRoot: HTMLElement

    constructor(props: any) {
        super(props)

        if (!modalRoot) {
            // throw new Error('Modal root is undefined')
            modalRoot = document.body
        }

        this.modalRoot = modalRoot
    }r

    componentDidMount() {
        this.modalRoot.appendChild(this.el)
    }

    componentWillUnmount() {
        this.modalRoot.removeChild(this.el)
    }

    render() {
        return ReactDOM.createPortal(this.props.children, this.el)
    }
}
