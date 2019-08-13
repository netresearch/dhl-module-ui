define([
    'underscore',
    'Dhl_Ui/js/model/shipping-option/selections',
    'uiRegistry'
], function (_, selectionsModel, registry) {
    'use strict';

    /**
     * @param {DhlInput} input
     * @param {} selections
     * @return {string}
     */
    var computeNewValue = function (input, selections) {
        var sourceItemOptionCode = input.item_combination_rule.source_item_input_code.split('.')[0],
            sourceItemInputCode = input.item_combination_rule.source_item_input_code.split('.')[1],
            sourceValues = [];

        if (!selections.items) {
            throw 'No items';
        }

        sourceValues = Object.values(selections.items).map(function (item) {
            var value = item[sourceItemOptionCode][sourceItemInputCode];

            /** Multiply with qty if we have an "add" rule. */
            if (input.item_combination_rule.action === 'add' && item.details.qty) {
                value = Number(value) * Number(item.details.qty);
            }

            return value;
        });

        if (input.item_combination_rule.action === 'add') {
            return String(
                sourceValues.reduce(
                    function (carry, value) {return carry + Number(value);},
                    0
                )
            );
        }

        return sourceValues.join(' ');
    };

    /**
     * @param {DhlInput} input
     * @param {string} optionCode
     * @param {} selections
     */
    var processCombinationRule = function(input, optionCode, selections) {
        registry.get({inputCode: input.code, shippingOptionCode: optionCode}, function (component) {
            try {
                component.value(computeNewValue(input, selections));
            } catch (e) {
                // If we can't compute a value, do nothing.
            }
        });
    };

    return {
        /**
         *
         * @param selections
         * @param {DhlShippingOption[]} packageOptions
         */
        apply: function (selections, packageOptions) {
            _.each(packageOptions, /** @param {DhlShippingOption} shippingOption */ function (shippingOption) {
                    _.each(shippingOption.inputs, /** @param {DhlInput} input */ function(input) {
                        if (input.item_combination_rule) {
                            processCombinationRule(input, shippingOption.code, selections);
                        }
                    });
                }
            );
        }
    };
});
