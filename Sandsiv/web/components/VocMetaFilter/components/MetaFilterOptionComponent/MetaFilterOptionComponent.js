import React from 'react';
import { components } from 'react-select';
import { TooltipWrapper } from '/components';

export const MetaFilterOptionComponent = (props) => {
    return (
        <div>
            <TooltipWrapper
                placement={ 'top' }
                delayShow={ 500 }
                value={ String(props.data.label) }>
                <div className={'meta-filter-tooltip-container'}>
                    <components.Option { ...props } className="voc-meta-filter__select-option"/>
                </div>
            </TooltipWrapper>
        </div>
    );
};


