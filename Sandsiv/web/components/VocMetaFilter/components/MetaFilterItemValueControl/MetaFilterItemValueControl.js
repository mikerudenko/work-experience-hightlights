import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NumberInput } from '/components/';
import CreatableSelect from 'react-select/lib/Creatable';
import { HelperService } from '/services';

export class MetaFilterItemValueControl extends Component {

    getManualValueControl() {
        let {attr, onChangeNumericValue, onChangeTextValue, value} = this.props;

        switch (attr.type) {
            case 'NUMERIC':
            case 'SCALABLE':
            case 'NPS':
                let valueToNumberInput = value;

                if (Array.isArray(valueToNumberInput)) {
                    valueToNumberInput = valueToNumberInput[0];
                }

                if (valueToNumberInput === null) {
                    onChangeNumericValue(0);
                }

                return (
                    <NumberInput
                        value={ valueToNumberInput || 0 }
                        changeHandler={ onChangeNumericValue }/>
                );
            default:
                return (
                    <input
                        type={ 'text' }
                        className={ 'form-control' }
                        value={ value || '' }
                        placeholder={ 'Value' }
                        onChange={ onChangeTextValue }
                    />
                );
        }
    }

    isValidNewOption(inputValue, value, options) {
        let returnValue = true;
        options.forEach(option => {
            if (inputValue.toLowerCase() === String(option.label) || inputValue.toLowerCase() === '') {
                returnValue = false;
            }
        });
        return returnValue;
    }

    render() {
        let {
            isMultiOperator,
            isChoiceAttribute,
            value,
            values,
            mapSelectOptions,
            onChangeValues,
            onChangeSelectValue,
            onOptionAdd,
            components
        } = this.props;
        let options;
        let selectValue;

        if (isChoiceAttribute) {
            options = mapSelectOptions({options: values});
            selectValue = HelperService.getSelectedValue(options, value)
        }

        return isChoiceAttribute
            ? (
                <CreatableSelect
                    className="vochub-select-control"
                    value={ selectValue }
                    isValidNewOption={ this.isValidNewOption }
                    classNamePrefix="vochub-select-control"
                    components={ components }
                    isClearable={ !isMultiOperator }
                    onCreateOption={ onOptionAdd }
                    isMulti={ isMultiOperator }
                    options={ options }
                    placeholder={ 'Value' }
                    onChange={ isMultiOperator ? onChangeValues : onChangeSelectValue }
                />
            )
            : this.getManualValueControl();
    }
}

MetaFilterItemValueControl.propTypes = {
    values: PropTypes.array,
    mapSelectOptions: PropTypes.func,
    value: PropTypes.any,
    isChoiceAttribute: PropTypes.bool,
    isMultiOperator: PropTypes.bool,
    onChangeValues: PropTypes.func,
    onChangeSelectValue: PropTypes.func,
    onOptionAdd: PropTypes.func
};
MetaFilterItemValueControl.defaultProps = {};
