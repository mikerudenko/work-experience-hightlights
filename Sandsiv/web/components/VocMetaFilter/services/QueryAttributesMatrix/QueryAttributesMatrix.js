export class QueryAttributesMatrix {
    //todo add common matrix interface
    static rules = [
        {
            condition: {
                attribute: {
                    is: ['TEXT']
                }
            },
            restriction: {
                operator: {
                    is: ['$empty', '$notempty']
                }
            },
            clone: true
        },

        {
            condition: {
                operator: {
                    not: ['$empty', '$notempty', '']
                },
            },
            restriction: {
                attribute: {
                    not: ['TEXT']
                }
            },
        },

        {
            condition: {
                operator: {
                    is: ['$in', '$nin']
                }
            },

            restriction: {
                attribute: {
                    is: ['NUMERIC', 'SCALABLE', 'NPS', 'META', 'NPS_SEGMENT', 'CHOICE', 'CLASSIFICATION', 'LANG']
                }
            }
        },

        {
            condition: {
                attribute: {
                    is: ['NPS_SEGMENT', 'CHOICE']
                }
            },

            restriction: {
                operator: {
                    is: ['$in', '$nin', '$empty', '$notempty']
                }
            }
        },

        {
            condition: {
                attribute: {
                    not: ['NUMERIC', 'SCALABLE', 'NPS', '', 'META', 'NPS_SEGMENT', 'CHOICE', 'CLASSIFICATION', 'LANG']
                }
            },

            restriction: {
                operator: {
                    not: ['$in', '$nin']
                }
            },
            clone: true
        },

        {
            condition: {
                attribute: {
                    not: ['NUMERIC', 'SCALABLE', 'NPS', '']
                }
            },

            restriction: {
                operator: {
                    not: ['$gte', '$gt', '$lt', '$lte']
                }
            }
        },

        {
            condition: {
                operator: {
                    is: ['$gte', '$gt', '$lt', '$lte']
                }
            }
            ,
            restriction: {
                value: {
                    not: ['']
                }
            }
        },

        {
            condition: {
                value: {
                    is: ['']
                }
            }
            ,
            restriction: {
                operator: {
                    not: ['$gte', '$gt', '$lt', '$lte']
                }
            }
        }

    ];

    static dublicateRules() {
        let newRules = [];

        QueryAttributesMatrix.rules.forEach(rule => {
            newRules.push(rule);

            if (rule.clone) {
                newRules.push({
                    condition: rule.restriction,
                    restriction: rule.condition
                });
            }
        });

        return newRules;
    }

    static getRuleConditionResult({condition, hashForCompare}) {
        let fields = Object.keys(condition),
            valid = true;

        fields.forEach(field => {
            valid &= (condition[field].hasOwnProperty('is'))
                ? condition[field].is.includes(hashForCompare[field])
                : !condition[field].not.includes(hashForCompare[field]);
        });

        return valid;
    }

    static makeSettingsRestriction({restriction, settings}) {
        let fields = Object.keys(restriction);

        fields.forEach(field => {
            settings[field + 's'] = settings[field + 's'].filter(({type, id}) => {
                let compareValue = type || id;

                return (restriction[field].hasOwnProperty('is'))
                    ? restriction[field].is.includes(compareValue)
                    : !restriction[field].not.includes(compareValue);
            });
        });

        return settings;
    }

    static processMartix({queryItem, settings, attributeValueKey}) {
        let attribute = settings.attributes.find(attribute => attribute[attributeValueKey] === queryItem.attribute);
        let attrValue = attribute ? attribute.type : '';
        let hashForCompare = {
            attribute: attrValue,
            value: settings.value,
            operator: queryItem.operator
        };

        QueryAttributesMatrix.dublicateRules();

        QueryAttributesMatrix.rules.forEach(rule => {
            let conditionResult = QueryAttributesMatrix.getRuleConditionResult({
                condition: rule.condition,
                hashForCompare
            });

            if (conditionResult) {
                settings = QueryAttributesMatrix.makeSettingsRestriction({restriction: rule.restriction, settings});
            }
        });

        return settings;
    }
}

