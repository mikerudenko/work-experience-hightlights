import React, { Component, Children, cloneElement, Fragment } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';

import { UncontrolledTooltip } from 'reactstrap';
import { TextService } from '/services';
import textContent from 'react-addons-text-content';
import uuidv4 from 'uuid/v4';

export class TooltipWrapper extends Component {
    _input = null;

    state = {
        childStyle: {},
        textConditions: {}
    };

    ref = React.createRef();

    @autobind
    getTooltipTarget() {
        return this.ref.current;
    }

    getInput() {
        return this._input;
    }

    getElementById(id) {
        return document.getElementById(id) || this._input;
    }

    componentDidMount() {
        if (!this.props.force) {
            let {fontSize, letterSpacing, fontFamily, display} = window.getComputedStyle(this._input);

            this.setState({
                childStyle: {
                    display
                },
                textConditions: {
                    fontSize,
                    letterSpacing,
                    fontFamily
                }
            });
        }
    }

    @autobind
    getParentWidth() {
        if (this._input) {
            const {
                clientWidth,
                scrollWidth
            } = this._input.parentElement;
            const {
                paddingLeft,
                paddingRight
            } = window.getComputedStyle(this._input.parentElement);

            const {
                paddingLeft: inputPaddingLeft,
                paddingRight: inputPaddingRight
            } = window.getComputedStyle(this._input);

            const padding = parseFloat(paddingLeft) + parseFloat(paddingRight);
            const inputPadding =  parseFloat(inputPaddingLeft) + parseFloat(inputPaddingRight);
            return (clientWidth || scrollWidth) - padding - inputPadding;
        } else {
            return null;
        }
    }

    mapChildren(id) {
        let {children} = this.props;

        return (
            Children.map(children, child =>
                cloneElement(child, {
                    ref: node => {
                        this._input = !(node instanceof Element)
                            ? findDOMNode(node)
                            : node;

                        // this._input = node;
                        (id && this._input) ? this._input.id = id : null;
                        const {ref} = child;
                        if (typeof ref === 'function') {
                            ref(node);
                        }
                    }
                })
            )
        );
    }

    getTooltipOvervay() {
        const {className, delayShow, placement = 'top', value} = this.props;
        const id = 'a' + uuidv4();
        return (
            <Fragment>
                { this.mapChildren(id) }

                <UncontrolledTooltip
                    className={ className }
                    placement={ placement }
                    target={ () => this.getElementById(id) }
                    trigger={'hover'}
                    delay={ delayShow }>
                    { value }
                </UncontrolledTooltip>
            </Fragment>

        )
    }

    getCap() {
        return (
            <Fragment>
                { this.mapChildren() }
            </Fragment>
        )
    }

    needToShowTooltip(text) {
        const {condition: {custom}, force} = this.props;

        if (force) {
            return true;
        }

        const width = this.getParentWidth();
        const {textConditions} = this.state;
        const compoundConditions = {...textConditions, width};
        let result = true;

        if (custom) {
            result = custom;
        }

        if (width) {
            result = result && TextService.isGreater({text, ...compoundConditions});
        }

        return result;
    }

    render() {
        const {children} = this.props;
        const text = textContent(children);

        return this.needToShowTooltip(text)
            ? this.getTooltipOvervay()
            : this.getCap();

    }
}

TooltipWrapper.propTypes = {
    value: PropTypes.any.isRequired,
    condition: PropTypes.object,
    placement: PropTypes.string,
    children: PropTypes.node,
    options: PropTypes.object,
    className: PropTypes.string,
    delayShow: PropTypes.number
};

TooltipWrapper.defaultProps = {
    condition: {},
    className: '',
    delayShow: 0
};
