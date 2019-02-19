define([
    'mage/utils/wrapper',
    'Dhl_Ui/js/action/checkout/validate-service-selection',
    'Dhl_Ui/js/action/checkout/save-service-selection'
], function (wrapper, validateServices, saveServices) {
    'use strict';

    /**
     * Intercept click on "Next" button in checkout
     * to validate and save service input values.
     */
    return function (setShippingInformationAction) {
        return wrapper.wrap(setShippingInformationAction, function (originalAction) {
            if (validateServices()) {
                //return saveServices().done(originalAction);
                return originalAction();
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
