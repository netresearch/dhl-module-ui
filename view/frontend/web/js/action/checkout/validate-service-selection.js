define([
    'underscore',
    'uiRegistry',
    'Dhl_Ui/js/action/checkout/validate-service-compatibility',
], function (_, registry, validateServiceCompatibility) {
    'use strict';

    /**
     * Trigger built in form input component validation of service inputs.
     *
     * @return {boolean}
     */
    var validateValues = function () {
        var shippingSettings = registry.get({component: 'Dhl_Ui/js/view/checkout/shipping-settings'}),
            result = true;

        debugger;
        return shippingSettings.validate();
        // _.each(inputs, function (input) {
        //     var validationResult = input.validate();
        //     if (!validationResult.valid) {
        //         result = false;
        //     }
        // });

        return result;
    };

    /**
     * Run uiComponent validators for DHL Service components and
     * return the composite validation result.
     *
     * @return {bool}
     */
    return function () {
        var compatibilityValid = validateServiceCompatibility();
        var valuesValid = validateValues();

        return compatibilityValid && valuesValid;
    };
});
