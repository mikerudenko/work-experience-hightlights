import React from 'react';
import PropTypes from 'prop-types';

export const MetaFilterItemAnd = function(props) {
    let {metaQuery, hasItems, isFullQueryItem, onAndCLicked} = props;

    return hasItems
        ? (
            <div className="voc-meta-filter__and-mark">
                <span>AND</span>
                <div className="voc-meta-filter__line-horizontal"/>
            </div>
        )
        : (
            <div className="voc-meta-filter__and-button-block">
                <div className="voc-meta-filter__line-horizontal"/>
                <button
                    disabled={ !isFullQueryItem(metaQuery) }
                    onClick={ onAndCLicked }
                    className="voc-meta-filter__button">
                    AND
                </button>
            </div>
        );
};

MetaFilterItemAnd.propTypes = {
    metaQuery: PropTypes.object,
    hasItems: PropTypes.bool,
    isFullQueryItem: PropTypes.func,
    onAndCLicked: PropTypes.func
};
