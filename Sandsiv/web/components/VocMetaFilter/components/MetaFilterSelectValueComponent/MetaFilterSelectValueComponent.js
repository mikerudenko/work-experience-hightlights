import React from 'react';
import { TooltipWrapper } from '/components';
import { components } from 'react-select';

export const MetaFilterSelectValueComponent = ({children, ...props}) => {
    let value = props.getValue();
    let tooltipValue = '';
    if (value.length) {
        tooltipValue = value[0].label;
    }

    if (tooltipValue.length === 0) {
        return (
            <components.ValueContainer { ...props } className="voc-meta-filter__select-option">
                <div className={ 'meta-filter-tooltip-container' }>
                    { children }
                </div>
            </components.ValueContainer>
        )
    }

    return (
        <components.ValueContainer { ...props } className="voc-meta-filter__select-option">
            <TooltipWrapper
                placement={ 'top' }
                delayShow={ 500 }
                value={ String(tooltipValue) }>
                <div className={ 'meta-filter-tooltip-container' }>
                    { children }
                </div>
            </TooltipWrapper>
        </components.ValueContainer>
    );
};


