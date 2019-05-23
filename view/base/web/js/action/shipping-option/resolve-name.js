define([
    'underscore',
    'Dhl_Ui/js/model/settings',
    'Dhl_Ui/js/model/shipping-option/shipping-option-codes',
], function (_, settings, codes) {
    'use strict';

    /**
     * Resolve a shipping option code to a human-readable shipping option label.
     *
     * @param {string} code
     * @return {string|boolean} - will return false if the requested shipping option does not exist
     */
    return function (code) {
        if (!settings.get()) {
            return false;
        }

        /** @var {DhlShippingOption} matchingOption */
        var matchingOption = _.find(settings.get().shipping_options, function (shippingOption) {
            return shippingOption.code === codes.getShippingOptionCode(code);
        });
        if (!matchingOption) {
            return false;
        }

        var label = matchingOption.label;

        if (codes.isCompoundCode(code)) {
            var matchingInput = _.find(
                matchingOption.inputs,
                function (input) {
                    return input.code === codes.getInputCode(code);
                }
            );
            if (matchingInput) {
                label += ' – ' + matchingInput.label
            }
        }

        return label;
    };
});
