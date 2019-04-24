define([
    'mage/translate',
    'mage/utils/wrapper',
    'uiRegistry',
    'Dhl_Ui/js/action/checkout/shipping-option/validation/validate-selection',
    'Dhl_Ui/js/action/checkout/shipping-option/validation/validate-compatibility',
    'Dhl_Ui/js/action/checkout/webapi/update-shipping-option-selection',
], function ($t, wrapper, registry, validateSelection, validateCompatibility, updateSelection) {
    'use strict';

    var getMessageContainer = function () {
        return registry.get('checkout.errors').messageContainer;
    };

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
                return {
                    /**
                     * Simulate a promise whose 'done' function is called by the caller.
                     *
                     * It makes sure that both the updateSelection and originalAction promise
                     * are completeted before continuing with the given callback.
                     * It also passes an error message to the checkout message container in case of failure.
                     */
                    'done': function (callback) {
                        updateSelection()
                            .done(function () {
                                originalAction().done(callback)
                            })
                            .fail(function () {
                                originalAction().done(function () {
                                    callback();
                                    getMessageContainer().addErrorMessage({
                                        'message': $t('Your shipping option selections could not be saved.'),
                                    });
                                })
                            });
                    }
                };
            } else {
                // do nothing
                return {'done': function () {}};
            }
        });
    }
});
