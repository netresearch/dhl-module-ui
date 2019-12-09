define([
    'jquery',
    'mage/translate',
    'mage/utils/wrapper',
    'uiRegistry',
    'Dhl_Ui/js/action/shipping-option/validation/validate-selection',
    'Dhl_Ui/js/action/shipping-option/validation/validate-compatibility',
    'Dhl_Ui/js/action/checkout/webapi/update-shipping-option-selection',
    'Magento_Checkout/js/model/shipping-service'
], function ($, $t, wrapper, registry, validateSelection, validateCompatibility, updateSelection, shippingService) {

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

            shippingService.isLoading(true);

            return $.Deferred(function (deferred) {
                if (selectionsValid && selectionsCompatible) {
                    updateSelection()
                    .done(function () {
                        originalAction().done(deferred.resolve);
                    })
                    .fail(function () {
                        originalAction().done(deferred.resolve);
                    });
                } else {
                    deferred.reject();
                }
            }).always(function () {
                shippingService.isLoading(false);
            }).fail(function () {
                getMessageContainer().addErrorMessage({
                    'message': $t('Your shipping option selections could not be saved.')
                });
            });
        });
    };
});
