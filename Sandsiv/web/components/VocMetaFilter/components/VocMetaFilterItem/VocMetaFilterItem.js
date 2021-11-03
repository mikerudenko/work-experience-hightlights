import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import Select from 'react-select';

import './VocMetaFilterItem.scss';
import { QueryAttributesMatrix } from '../../services/QueryAttributesMatrix/';
import { MenuList } from '/components';
import { HelperService } from '/services';

import {
    MetaFilterItemOr,
    MetaFilterItemAnd,
    MetaFilterItemRemove,
    MetaFilterItemValueControl,
    MetaFilterOptionComponent,
    MetaFilterSelectValueComponent
} from '../';

import { SourceService } from '/services';

export class VocMetaFilterItem extends Component {

    static operators = [
        {id: '$in', name: 'Equal'},
        {id: '$nin', name: 'Not Equal'},
        {id: '$gte', name: '>='},
        {id: '$gt', name: '>'},
        {id: '$lt', name: '<'},
        {id: '$lte', name: '<='},
        {id: '$empty', name: 'Is empty'},
        {id: '$notempty', name: 'Is not empty'}
    ];

    state = {
        manualValues: []
    };

    mapSelectOptions({options, valueKey = 'id'}) {
        return options.map(option => {
            let value = option[valueKey];

            return {
                value,
                label: option.name
            }
        });
    }

    componentDidMount() {
        let {metaQuery: {value}} = this.props;
        let attr = this.getAttribute();

        if (!Array.isArray(value)) {
            let isValueInOption = attr.options.find(attrOption => attrOption.id === value);

            if (!isValueInOption) {
                this.setState({
                    manualValues: [
                        {
                            id: value,
                            name: value
                        }
                    ]
                });
            }
        } else {
            let manualValues = value
                .filter(valueId => {
                    return !attr.options.find(attrOption => attrOption.id === valueId);
                })
                .map(valueId => ({
                    id: valueId,
                    name: valueId
                }));

            this.setState({manualValues});
        }
    }

    componentWillUnmount() {
        this.setState({manualValues: []})
    }

    getAttribute() {
        let {metaQuery: {attribute}, attributes, attributeValueKey} = this.props;
        return attributes.find(attr => attr[attributeValueKey] === attribute) || {options: []};
    }

    isChoiceAttribute() {
        return this.getAttribute().options.length > 0;
    }

    onChangeItem(data) {
        let {metaQuery, onChangedMetaQueryItem} = this.props;

        Object.keys(data)
            .forEach(key => {
                metaQuery[key] = data[key];
            });

        onChangedMetaQueryItem(parent);
    }

    isMultiOperator() {
        let {metaQuery: {operator}} = this.props;
        return ['$in', '$nin'].includes(operator);
    }

    @autobind
    onChangeOperator(operatorOption) {
        let value = !operatorOption ? '' : operatorOption.value;
        this.onChangeItem({operator: value, value: null});
    }

    @autobind
    onChangeAtribute(attributeOption) {
        let value = !attributeOption ? '' : attributeOption.value;
        this.onChangeItem({attribute: value, value: null});

        this.setState({manualValues: []});
    }

    @autobind
    onChangeValues(valueOptions) {
        if (valueOptions) {
            valueOptions = valueOptions.map(option => option.value);
        }

        this.onChangeItem({value: valueOptions || ''});
    }

    @autobind
    onChangeSelectValue(valueOption) {
        let value = valueOption && valueOption.value;
        this.onChangeItem({value});
    }

    @autobind
    onChangeTextValue(event) {
        let value = event.target.value;
        let data = {value: this.isMultiOperator() ? [value] : value};
        this.onChangeItem(data);
    }

    @autobind
    onChangeNumericValue(value) {
        let data = {value: this.isMultiOperator() ? [value] : value};
        this.onChangeItem(data);
    }

    getRelativeDivOffset(element) {
        let offset = element.offsetLeft;

        if (!element.classList.contains('voc-meta-filter')) {
            offset += this.getRelativeDivOffset(element.offsetParent)
        }

        return offset;
    }

    @autobind
    onAndCLicked(event) {
        let {onChangedMetaQueryItem, metaQuery, parent, getBaseItem, setScrollOffset} = this.props;
        let baseItem = getBaseItem();
        metaQuery.items = [baseItem];

        let relativeOffset = this.getRelativeDivOffset(event.target);

        if (relativeOffset > 700) {
            setScrollOffset();
        }

        onChangedMetaQueryItem(parent);
    }

    @autobind
    onRemoveClick() {
        let {onChangedMetaQueryItem, parent, metaQuery} = this.props;
        let index = parent.items.findIndex(x => x === metaQuery);

        parent.items.splice(index, 1);
        onChangedMetaQueryItem(parent);
    }

    @autobind
    onOrCLicked() {
        let {onChangedMetaQueryItem, parent, getBaseItem} = this.props;
        let baseItem = getBaseItem();

        parent.items.push(baseItem);
        onChangedMetaQueryItem(parent);
    }

    isNumericAttribute() {
        let attr = this.getAttribute();
        return SourceService.isNumericAttribute(attr);
    }

    @autobind
    onOptionAdd(option) {
        let {manualValues} = this.state;
        let {metaQuery: {value}} = this.props;
        let isNumericAttr = this.isNumericAttribute();
        let {values} = this.getSettings();
        let attr = this.getAttribute();

        let id = option.trim().split(/\s+/).join(' ');
        let name = option.trim().split(/\s+/).join(' ');

        option = {
            id: isNumericAttr ? Number(id) : id,
            name: isNumericAttr ? Number(name) : name
        };

        let rejectConditions = [
            isNumericAttr && Number.isNaN(option.id),
            isNumericAttr && !Number.isFinite(option.id),
            option.id === '',
            ['LABEL', 'CLASSIFICATION', 'NPS_SEGMENT'].includes(attr.originType),
            this.getAttributeValues(values).some(val => val.id === option.id)
        ];

        if (rejectConditions.some(condition => condition)) {
            return false;
        }

        manualValues.push(option);
        this.setState({manualValues});
        this.onChangeItem({
            value: this.isMultiOperator()
                ? (value !== null ? value.concat(option.id) : [option.id])
                : option.id
        });
    }

    isFullQueryItem(metaQuery) {
        let {attribute, operator, value} = metaQuery;
        let hasValue = Array.isArray(value)
            ? value.length > 0
            : !['', undefined].includes(value);
        let isNullOperator = ['$empty', '$notempty'].includes(operator);

        return isNullOperator
            ? attribute && operator
            : attribute && operator && hasValue;
    }

    hideValueOperator() {
        let {metaQuery: {operator}} = this.props;
        return ['$empty', '$notempty'].includes(operator);
    }

    getAttributeValues(values) {
        let {manualValues} = this.state;

        return values.concat(manualValues);
    }

    getSettings() {
        let {attributes, metaQuery, attributeValueKey} = this.props;
        let operators = VocMetaFilterItem.operators;
        attributes = Array.from(attributes);
        let attr = attributes.find(attr => attr[attributeValueKey] === metaQuery.attribute);

        //convertion of null values - todo replace on BE
        if (attr) {
            attr.options = attr.options.map(option => {
                if (option.name === '') {
                    option = {
                        name: 'No value',
                        id: ''
                    };
                }
                return option;
            });
        }

        return QueryAttributesMatrix.processMartix({
            queryItem: metaQuery,
            attributeValueKey,
            settings: {
                attributes,
                values: attr ? attr.options : [],
                operators: Array.from(operators)
            }
        });
    }

    render() {
        let {metaQuery, attributeValueKey, attributePlaceholder, parent, hasItems} = this.props;
        let {operator, attribute} = metaQuery;
        let {attributes, operators, values} = this.getSettings();
        let {metaQuery: {value}} = this.props;
        const attributeOptions = this.mapSelectOptions({
            options: attributes,
            valueKey: attributeValueKey
        });
        const attributeValue = HelperService.getSelectedValue(attributeOptions, attribute);
        const operatorOptions = this.mapSelectOptions({
            options: operators
        });
        const operatorValue = HelperService.getSelectedValue(operatorOptions, operator);

        return (
            <Fragment>
                <div className="voc-meta-filter__form-wrapper">
                    <div className="voc-meta-filter__item-form">
                        <Select
                            className="vochub-select-control voc-meta-filter__attr-select"
                            classNamePrefix="vochub-select-control"
                            value={ attributeValue }
                            components={ {
                                MenuList,
                                Option: MetaFilterOptionComponent,
                                ValueContainer: MetaFilterSelectValueComponent
                            } }
                            openMenuOnFocus={ true }
                            isClearable={ true }
                            onFocus={ this.onFocus }
                            options={ attributeOptions }
                            placeholder={ attributePlaceholder }
                            onChange={ this.onChangeAtribute }
                        />

                        <Select
                            className="vochub-select-control voc-meta-filter__operator-select"
                            classNamePrefix="vochub-select-control"
                            value={ operatorValue }
                            components={ {
                                MenuList,
                                Option: MetaFilterOptionComponent,
                                ValueContainer: MetaFilterSelectValueComponent
                            } }
                            openMenuOnFocus={ true }
                            isClearable={ true }
                            options={ operatorOptions }
                            placeholder={ 'Operator' }
                            onChange={ this.onChangeOperator }
                        />

                        { !this.hideValueOperator() && (
                            <MetaFilterItemValueControl
                                isChoiceAttribute={ this.isChoiceAttribute() }
                                value={ value }
                                onChangeNumericValue={ this.onChangeNumericValue }
                                onChangeTextValue={ this.onChangeTextValue }
                                attr={ this.getAttribute() }
                                mapSelectOptions={ this.mapSelectOptions }
                                components={ {
                                    Option: MetaFilterOptionComponent
                                } }
                                onOptionAdd={ this.onOptionAdd }
                                onChangeValues={ this.onChangeValues }
                                onChangeSelectValue={ this.onChangeSelectValue }
                                isMultiOperator={ this.isMultiOperator() }
                                values={ this.getAttributeValues(values) }/>
                        ) }

                    </div>
                    <MetaFilterItemAnd
                        metaQuery={ metaQuery }
                        hasItems={ hasItems }
                        isFullQueryItem={ this.isFullQueryItem }
                        onAndCLicked={ this.onAndCLicked }
                    />
                    <MetaFilterItemRemove
                        parent={ parent }
                        onRemoveClick={ this.onRemoveClick }
                    />
                </div>
                <MetaFilterItemOr
                    metaQuery={ metaQuery }
                    parent={ parent }
                    isFullQueryItem={ this.isFullQueryItem }
                    onOrCLicked={ this.onOrCLicked }
                />
            </Fragment>
        );
    }
}

VocMetaFilterItem.propTypes = {
    attributes: PropTypes.array,
    onChangedMetaQueryItem: PropTypes.func,
    attributePlaceholder: PropTypes.string,
    setScrollOffset: PropTypes.func,
    onRemoveClick: PropTypes.func,
    metaQuery: PropTypes.object,
    parent: PropTypes.object,
    hasItems: PropTypes.bool,
    attributeValueKey: PropTypes.oneOf(['name', 'id', 'index'])
};

VocMetaFilterItem.defaultProps = {
    showRemove: true,
    attributeValueKey: 'id'
};
