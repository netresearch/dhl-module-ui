define([
    'underscore',
    'Dhl_Ui/js/model/shipping-option/selections',
    'uiRegistry'
], function (_, selectionsModel, registry) {
    'use strict';

    /**
     * Extract an array of string and/or number values
     * from inputs that match the given rule.
     *
     * @param {DhlItemSelections} itemSelections
     * @param {DhlItemCombinationRule} combinationRule
     * @param {string} section  The package id of the input
     * @return {Array<string|number>}
     */
    var extractSourceValues = function (itemSelections, combinationRule, section) {
        var sourceValues = [];

        /**
         * Collect values from source item inputs.
         */
        _.each(Object.values(itemSelections), function (item) {
            var sourceItemOptionCode = combinationRule.source_item_input_code.split('.')[0],
                sourceItemInputCode = combinationRule.source_item_input_code.split('.')[1],
                value;

            /**
             * Items without quantity are not considered
             */
            if (item.details.qty === 0) {
                return;
            }

            /**
             * Source items that are not selected are not considered
             */
            if (!(sourceItemOptionCode in item) || !(sourceItemInputCode in item[sourceItemOptionCode])) {
                return;
            }

            value = item[sourceItemOptionCode][sourceItemInputCode];

            /** Multiply with item qty if we have an "add" rule. */
            if (combinationRule.action === 'add') {
                value = Number(value) * Number(item.details.qty);
            }

            sourceValues.push(value);
        });

        /**
         * Collect additional source input values.
         */
        _.each(combinationRule.additional_source_input_codes, function (compoundCode) {
            var optionCode = compoundCode.split('.')[0],
                inputCode = compoundCode.split('.')[1],
                value = selectionsModel.getShippingOptionValue(
                    section,
                    optionCode,
                    inputCode,
                    false
                );

            if (value) {
                sourceValues.unshift(value);
            }
        });

        return sourceValues;
    };

    /**
     * @param {DhlItemCombinationRule} combinationRule
     * @param {DhlItemSelections} itemSelections
     * @param {string} section
     * @return {string}
     */
    var computeNewValue = function (combinationRule, itemSelections, section) {
        /**
         * @var {string} newValue
         */
        var newValue = '';
        var sourceValues = extractSourceValues(itemSelections, combinationRule, section);

        if (combinationRule.action === 'add') {
            /**
             * For "add" rules, create the sum of the source values.
             */
            newValue = String(sourceValues.reduce(
                function (carry, value) {
                    return (Number(carry) + Number(value)).toFixed(2);
                },
                0
            ));
        } else if (combinationRule.action === 'concat') {
            /**
             * For "concat" rules, concatenate the source values.
             */
            newValue = sourceValues.filter(Boolean).join(', ');
        } else {
            console.error('Invalid item combination rule action "' + combinationRule.action + '"');
        }

        return newValue;
    };

    /**
     * Load component by input and option code
     * and update value according to item combination rules.
     *
     * @param {string} inputCode    To identify the input to modify.
     * @param {string} optionCode   To identify the input to modify.
     * @param {DhlItemCombinationRule} combinationRule  The rule to apply.
     * @param {DhlItemSelections} itemSelections   The source of item input values to process.
     */
    var processCombinationRule = function (
        inputCode,
        optionCode,
        combinationRule,
        itemSelections
    ) {
        registry.get({inputCode: inputCode, shippingOptionCode: optionCode}, function (component) {
            component.value(
                computeNewValue(combinationRule, itemSelections, component.section)
            );
        });
    };

    return {
        /**
         * Process every package option's combination rules by
         * combining values from itemSelections and updating the package
         * option components value.
         *
         * @param {DhlItemSelections} itemSelections        Contains the values of all item inputs
         *                                                  of the current package.
         * @param {DhlShippingOption[]} shippingOptions     List of shipping options whose item
         *                                                  combination rules to process.
         */
        apply: function (itemSelections, shippingOptions) {
            _.each(shippingOptions, /** @param {DhlShippingOption} shippingOption */ function (shippingOption) {
                _.each(shippingOption.inputs, /** @param {DhlInput} input */ function (input) {
                    if (input.item_combination_rule) {
                        processCombinationRule(
                            input.code,
                            shippingOption.code,
                            input.item_combination_rule,
                            itemSelections
                        );
                    }
                });
            });
        }
    };
});
