import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ToastList } from './components/ToastList';
import { removeToast } from './modules/Toasts.modules';
import { toastsSelector } from './modules/Toasts.selectors';

const mapStateToProps = state => ({
    toasts: toastsSelector(state)
});

const mapDispatchToProps = {
    removeToast
};

export default
@connect(mapStateToProps, mapDispatchToProps)
class Toasts extends Component {
    render() {
        return (
            <div className="voc-toasts">
                <ToastList toasts={this.props.toasts} removeToast={this.props.removeToast}/>
            </div>
        )
    }
}
