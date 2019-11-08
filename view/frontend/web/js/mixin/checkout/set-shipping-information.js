define([
    'mage/translate',
    'mage/utils/wrapper',
    'uiRegistry',
    'Dhl_Ui/js/action/shipping-option/validation/validate-selection',
    'Dhl_Ui/js/action/shipping-option/validation/validate-compatibility',
], function ($t, wrapper, registry, validateSelection, validateCompatibility) {
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
                return originalAction();
            }

            // do nothing
            return {'done': function () {}};
        });
    };
});
