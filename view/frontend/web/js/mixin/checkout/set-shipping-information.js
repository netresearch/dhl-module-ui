define([
    'mage/utils/wrapper',
    'Dhl_Ui/js/action/checkout/validate-service-selection',
    'Dhl_Ui/js/action/checkout/validate-service-compatibility',
    'Dhl_Ui/js/action/checkout/rest/save-service-selection'
], function (wrapper, validateServiceSelection, validateServiceCompatibility, saveServiceSelection) {
    'use strict';

    /**
     * Intercept click on "Next" button in checkout
     * to validate and save service input values.
     *
     * @param {callback} setShippingInformationAction
     */
    return function (setShippingInformationAction) {
        return wrapper.wrap(setShippingInformationAction, function (originalAction) {
            var servicesValid = validateServiceSelection(),
                servicesCompatible = validateServiceCompatibility();
            if (servicesValid && servicesCompatible) {
                return saveServiceSelection().done(originalAction);
            } else {
                // do nothing
                return {
                    'done': function () {
                    }
                }
            }
        });
    }
});
