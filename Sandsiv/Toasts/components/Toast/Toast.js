import React, { Component } from 'react';
import { autobind } from 'core-decorators';
import './Toast.scss';

export class Toast extends Component {
    shouldComponentUpdate() {
        return false;
    }

    componentDidMount() {
        this.initCloseTimeout();
    }

    componentWillUnmount() {
        this.resetCloseTimeout();
    }

    @autobind
    onClick() {
        const {
            id,
            removeToast
        } = this.props;

        removeToast(id);
    }

    @autobind
    onMouseEnter() {
        this.resetCloseTimeout();
    }

    @autobind
    onMouseLeave() {
        this.initCloseTimeout();
    }

    initCloseTimeout() {
        const {
            removeToast,
            id,
            timeout
        } = this.props;

        this.timeout = window.setTimeout(() => removeToast(id), timeout);
    }

    resetCloseTimeout() {
        if (this.timeout) {
            window.clearTimeout(this.timeout);
        }
    }

    render() {
        const {
            text,
            type
        } = this.props;
        return (
            <div className={ `voc-toasts__item ${type}` }
                 onClick={ this.onClick }
                 onMouseEnter={ this.onMouseEnter }
                 onMouseLeave={ this.onMouseLeave }
            >
                <div className="voc-toasts__item-text">
                    <span>{ text }</span>
                </div>
            </div>
        )
    }
}
