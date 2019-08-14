define([
    'underscore',
    'Dhl_Ui/js/model/shipping-settings',
    'Dhl_Ui/js/model/shipping-option/shipping-option-codes',
    'Dhl_Ui/js/model/current-carrier',
], function (_, shippingSettings, codes, currentCarrier) {
    'use strict';

    /**
     * Resolve a shipping option code to a human-readable shipping option label.
     *
     * @param {string} code
     * @return {string|boolean} - will return false if the requested shipping option does not exist
     */
    return function (code) {
        var shippingSettingsData = shippingSettings.getByCarrier(currentCarrier.get()),
            matchingOption,
            matchingInput,
            label;

        if (!shippingSettingsData) {
            return false;
        }

        /** @var {DhlShippingOption} matchingOption */
        matchingOption = _.find(shippingSettingsData.service_options, function (shippingOption) {
            return shippingOption.code === codes.getShippingOptionCode(code);
        });
        if (!matchingOption) {
            return false;
        }

        label = matchingOption.label;

        if (codes.isCompoundCode(code)) {
            matchingInput = _.find(
                matchingOption.inputs,
                function (input) {
                    return input.code === codes.getInputCode(code);
                }
            );
            if (matchingInput) {
                label += ' – ' + matchingInput.label;
            }
        }

        return label;
    };
});
