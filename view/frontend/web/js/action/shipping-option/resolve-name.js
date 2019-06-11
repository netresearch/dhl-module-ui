define([
    'underscore',
    'Dhl_Ui/js/model/checkout-data',
    'Dhl_Ui/js/model/checkout/shipping-option/shipping-option-codes',
], function (_, checkoutData, codes) {
    'use strict';

    /**
     * Resolve a shipping option code to a human-readable shipping option label.
     *
     * @param {string} carrier
     * @param {string} code
     * @return {string|boolean} - will return false if the requested shipping option does not exist
     */
    return function (carrier, code) {
        var carrierData = checkoutData.getByCarrier(carrier),
            label = '';

        if (!carrierData) {
            return false;
        }

        /** @var {DhlShippingOption} matchingOption */
        var matchingOption = _.find(carrierData.service_options, function (shippingOption) {
            return shippingOption.code === codes.getShippingOptionCode(code);
        });
        if (!matchingOption) {
            return false;
        }

        label = matchingOption.label;

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
