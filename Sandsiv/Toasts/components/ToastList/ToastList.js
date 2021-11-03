import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Toast } from '../../components/Toast';
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import './ToastList.scss';

export class ToastList extends Component {
    render() {
        const {
            toasts,
            removeToast
        } = this.props;

        return (
            <TransitionGroup>
                {
                    toasts.map(toast => {
                        return (
                            <CSSTransition
                                key={toast.id}
                                timeout={750}
                                classNames={'flip'}
                            >
                                <Toast { ...toast } removeToast={ removeToast }/>
                            </CSSTransition>
                        )
                    })
                }
            </TransitionGroup>
        )
    }
}

ToastList.propTypes = {
    removeToast: PropTypes.func,
    toasts: PropTypes.arrayOf(PropTypes.object)
};
