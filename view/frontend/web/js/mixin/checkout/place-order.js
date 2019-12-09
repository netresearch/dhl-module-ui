define([
    'jquery',
    'mage/translate',
    'mage/utils/wrapper',
    'Dhl_Ui/js/model/checkout/storage',
    'Dhl_Ui/js/action/shipping-option/validation/validate-selection',
    'Dhl_Ui/js/action/shipping-option/validation/validate-compatibility',
    'Dhl_Ui/js/action/checkout/webapi/update-shipping-option-selection'
], function ($, $t, wrapper, storage, validateSelection, validateCompatibility, updateSelection) {
    'use strict';

    /**
     * Clear the DHL checkout storage when placing the order to reset
     * the customer's shipping option selections for their next quote.
     *
     * @see 'Magento_Checkout/js/action/place-order'
     * */
    return function (placeOrder) {
        return wrapper.wrap(placeOrder, function (originalAction, paymentData, messageContainer) {
            var selectionsValid = validateSelection(),
                selectionsCompatible = validateCompatibility();

            return $.Deferred(function (deferred) {
                if (selectionsValid && selectionsCompatible) {
                    updateSelection()
                    .done(function () {
                        originalAction(paymentData, messageContainer).done(deferred.resolve);
                    })
                    .fail(deferred.reject);
                } else {
                    deferred.reject();
                }
            })
            .done(storage.clear)
            .fail(function () {
                messageContainer.addErrorMessage({
                    'message': $t('Your shipping option selections could not be saved.')
                });
            });
        });
    };
});
