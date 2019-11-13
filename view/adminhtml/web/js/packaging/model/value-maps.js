define([
    'underscore',
    'Dhl_Ui/js/model/shipping-option/selections',
    'Dhl_Ui/js/model/shipping-option/shipping-option-codes',
    'uiRegistry'
], function (_, selectionsModel, optionCodes, registry) {
    'use strict';

    /**
     * Read value map, decide if to apply it and set new dependend values via registry.
     *
     * @param {string} selectionValue   The currently set value on the input
     * @param {DhlValueMap} valueMap The valueMap to process
     */
    var processValueMap = function (selectionValue, valueMap) {
        if (valueMap.source_value !== selectionValue) {
            return;
        }

        _.each(valueMap.input_values, function (inputValue) {
            var inputCode = optionCodes.getInputCode(inputValue.code),
                optionCode = optionCodes.getShippingOptionCode(inputValue.code);

            registry.get(
                {inputCode: inputCode, shippingOptionCode: optionCode},
                function (component) {
                    component.value(inputValue.value);
                }
            );
        });
    };

    return {
        /**
         * Go through shipping option inputs and process value maps
         *
         * @param {DhlShippingOption[]} shippingOptions List of shipping options to process
         * @param {string} section                      Section name of the shipping options
         *
         */
        apply: function (shippingOptions, section) {
            _.each(shippingOptions, /** @type {DhlShippingOption} */ function (shippingOption) {
                _.each(shippingOption.inputs, /** @type {DhlInput} */ function (input) {
                    var selectionValue;

                    if (input.value_maps.length === 0) {
                        return;
                    }

                    selectionValue = selectionsModel.getShippingOptionValue(
                        section,
                        shippingOption.code,
                        input.code,
                        false
                    );
                    _.each(input.value_maps, /** @type {DhlValueMap} */ function (map) {
                        processValueMap(selectionValue, map);
                    });
                });
            });
        }
    };
});
