define([
    'mage/utils/wrapper',
    'Dhl_Ui/js/action/checkout/shipping-option/validation/validate-selection',
    'Dhl_Ui/js/action/checkout/shipping-option/validation/validate-compatibility',
    'Dhl_Ui/js/action/checkout/webapi/update-shipping-option-selection'
], function (wrapper, validateSelection, validateCompatibility, updateSelection) {
    'use strict';

    /**
     * Intercept click on "Next" button in checkout
     * to validate and save shipping option input values.
     *
     * @param {callback} setShippingInformationAction
     */
    return function (setShippingInformationAction) {
        return wrapper.wrap(setShippingInformationAction, function (originalAction) {
            var selectionsValid = validateSelection(),
                selectionsCompatible = validateCompatibility();
            if (selectionsValid && selectionsCompatible) {
                return updateSelection().done(originalAction);
            } else {
                // do nothing
                return {'done': function () {}}
            }
        });
    }
});
