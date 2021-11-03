import React from 'react';
import PropTypes from 'prop-types';

export const MetaFilterItemRemove = function(props) {
    let {parent, onRemoveClick} = props;
    let isFirstItem = parent.hash === 'root' && parent.items.length === 1;

    return isFirstItem
        ? false
        : (
            <div onClick={ onRemoveClick }
                 className="voc-meta-filter__item-remove-btn">
                X
            </div>
        );
};

MetaFilterItemRemove.propTypes = {
    onRemoveClick: PropTypes.func,
    parent: PropTypes.object
};

