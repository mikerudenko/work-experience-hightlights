import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { VocMetaFilterItem } from './components';
import { autobind } from 'core-decorators';

const uuidv4 = require('uuid/v4');

import './VocMetaFilter.scss';

const getInitialState = () => ({
    drag: {
        curYPos: null,
        curXPos: null,
        curDown: false
    }
});

export class VocMetaFilter extends Component {

    state = getInitialState();

    renderItem({metaQuery, parent, index}) {
        let {source, onChangedMetaQueryItem, attributeValueKey, attributePlaceholder} = this.props;
        let hasItems = metaQuery.items && metaQuery.items.length > 0;

        return (
            <div className="voc-meta-filter__or-wrapper" key={ index }>
                <div className="voc-meta-filter__item-wrapper">
                    <VocMetaFilterItem
                        attributeValueKey={ attributeValueKey }
                        parent={ parent }
                        attributePlaceholder={ attributePlaceholder }
                        getBaseItem={ this.getBaseItem }
                        setScrollOffset={ this.setScrollOffset }
                        metaQuery={ metaQuery }
                        hasItems={ hasItems }
                        onChangedMetaQueryItem={ onChangedMetaQueryItem }
                        attributes={ source.attributes }/>
                </div>
                { hasItems && this.mapItems(metaQuery) }
            </div>
        );
    }

    mapItems(metaQuery) {
        let result = metaQuery.items.map((queryItem, index) => {
            return this.renderItem({metaQuery: queryItem, parent: metaQuery, index});
        });

        return (
            <div className="voc-meta-filter__or-blocks">
                { result }
            </div>
        );
    }

    @autobind
    setMetafilterNode(element) {
        this.metafilterNode = element;
    }

    @autobind
    setScrollOffset() {
        Promise.resolve()
            .then(() => {
                this.metafilterNode.scrollLeft = this.metafilterNode.scrollWidth - this.metafilterNode.offsetWidth;
            });
    }

    getBaseItem() {
        return {
            attribute: '',
            operator: '',
            value: null,
            hash: uuidv4(),
            items: []
        }
    }

    @autobind
    dragAction(event) {
        let {drag: {curDown, curYPos, curXPos}} = this.state;

        if (curDown) {
            let scrollXValue = this.metafilterNode.scrollLeft + (curXPos - event.pageX);
            let scrollYValue = this.metafilterNode.scrollTop + (curYPos - event.pageY);
            this.metafilterNode.scrollTo(scrollXValue, scrollYValue);
            this.setState({
                drag: {
                    curYPos: event.pageY,
                    curXPos: event.pageX,
                    curDown: true
                }
            });
        }
    }

    @autobind
    enableDrag(event) {
        let notControls = Array.from(event.target.classList).every(className => {
            return ![
                'Select-control',
                'voc-meta-filter__button',
                'voc-meta-filter__select-option',
                'Select-placeholder',
                'voc-meta-filter__item-form',
                'Select-multi-value-wrapper'
            ].includes(className);
        });

        if (notControls) {
            this.setState({
                drag: {
                    curYPos: event.pageY,
                    curXPos: event.pageX,
                    curDown: true
                }
            });
        }

    }

    @autobind
    disableDrag() {
        this.setState(getInitialState());
    }

    render() {
        let {metaQuery} = this.props;
        let isEmptyQuery = metaQuery.items.length === 0;
        if (isEmptyQuery) {
            metaQuery.items.push(this.getBaseItem());
        }

        return (
            <div
                onMouseMove={ this.dragAction }
                onMouseDown={ this.enableDrag }
                onMouseUp={ this.disableDrag }
                onMouseLeave={ this.disableDrag }
                ref={ this.setMetafilterNode }
                className="voc-meta-filter">
                { this.mapItems(metaQuery) }
            </div>
        );
    }
}

VocMetaFilter.propTypes = {
    onChangedMetaQueryItem: PropTypes.func,
    source: PropTypes.object,
    attributeValueKey: PropTypes.oneOf(['id', 'name', 'index']),
    readyOnly: PropTypes.bool,
    metaQuery: PropTypes.object,
    attributePlaceholder: PropTypes.string
};

VocMetaFilter.defaultProps = {
    readyOnly: false,
    attributePlaceholder: 'Attribute'
};
