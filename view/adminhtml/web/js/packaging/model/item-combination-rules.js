define([
    'underscore',
    'Dhl_Ui/js/model/shipping-option/selections',
    'uiRegistry'
], function (_, selectionsModel, registry) {
    'use strict';

    /**
     * @param {DhlInput} input
     * @param {*} selectionItems
     * @return {string}
     */
    var computeNewValue = function (input, selectionItems) {
        var sourceItemOptionCode = input.item_combination_rule.source_item_input_code.split('.')[0],
            sourceItemInputCode = input.item_combination_rule.source_item_input_code.split('.')[1],
            sourceValues,
            newValue;

        sourceValues = Object.values(selectionItems).map(function (item) {
            var value = '';

            if (item[sourceItemOptionCode][sourceItemInputCode] && item.details.qty > 0.0) {
                value = item[sourceItemOptionCode][sourceItemInputCode];
            }

            /** Multiply with qty if we have an "add" rule. */
            if (input.item_combination_rule.action === 'add' && item.details.qty) {
                value = Number(value) * Number(item.details.qty);
            }

            return value;
        });

        if (input.item_combination_rule.action === 'add') {
            newValue = String(
                sourceValues.reduce(
                    function (carry, value) {return carry + Number(value);},
                    0
                )
            );
        } else if(input.item_combination_rule.action === 'concat') {
            newValue = sourceValues.filter(Boolean).join(', ');
        } else {
            throw 'Invalid item combination rule action "' + input.item_combination_rule.action + '"';
        }

        return newValue;
    };

    /**
     * @param {DhlInput} input
     * @param {string} optionCode
     * @param {*} selectionItems
     */
    var processCombinationRule = function(input, optionCode, selectionItems) {
        registry.get({inputCode: input.code, shippingOptionCode: optionCode}, function (component) {
            try {
                component.value(computeNewValue(input, selectionItems));
            } catch (e) {
                // If we can't compute a value, do nothing.
            }
        });
    };

    return {
        /**
         * Process every every package option's combination rules by
         * combining values from selectionItems and updating the package
         * option components value.
         *
         * @param {*} selectionItems
         * @param {DhlShippingOption[]} packageOptions
         */
        apply: function (selectionItems, packageOptions) {
            if (!selectionItems) {
                return;
            }
            console.warn('Applying item combination rules …');
            _.each(packageOptions, /** @param {DhlShippingOption} shippingOption */ function (shippingOption) {
                    _.each(shippingOption.inputs, /** @param {DhlInput} input */ function(input) {
                        if (input.item_combination_rule) {
                            processCombinationRule(input, shippingOption.code, selectionItems);
                        }
                    });
                }
            );
        }
    };
});
