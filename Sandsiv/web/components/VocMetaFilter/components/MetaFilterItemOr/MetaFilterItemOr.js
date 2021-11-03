import React from 'react';
import PropTypes from 'prop-types';

export const MetaFilterItemOr = function(props) {
    let {metaQuery, parent, isFullQueryItem, onOrCLicked} = props;
    let isLastItem = parent.items[parent.items.length - 1] === metaQuery;

    return isLastItem
        ? (
            <div className="voc-meta-filter__or-button-block">
                <div className="voc-meta-filter__line-vertical"/>
                <button
                    disabled={ !isFullQueryItem(metaQuery) }
                    onClick={ onOrCLicked }
                    className="voc-meta-filter__button">
                    OR
                </button>
            </div>
        )
        : (
            <div className="voc-meta-filter__or-mark">
                <span>OR</span>
                <div className="voc-meta-filter__line-vertical"/>
            </div>
        );
};

MetaFilterItemOr.propTypes = {
    metaQuery: PropTypes.object,
    parent: PropTypes.object,
    isFullQueryItem: PropTypes.func,
    onOrCLicked: PropTypes.func
};

