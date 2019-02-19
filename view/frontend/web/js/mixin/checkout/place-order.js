define([
    'mage/utils/wrapper',
    'Dhl_Ui/js/model/checkout/storage'
], function (wrapper, storage) {
    'use strict';

    /**
     * Clear the DHL checkout storage when placing the order to reset
     * the customer's service selections for their next quote.
     *
     * @see 'Magento_Checkout/js/action/place-order'
     * */
    return function (placeOrder) {
        return wrapper.wrap(placeOrder, function (origFunc, paymentData, messageContainer) {
            return origFunc(paymentData, messageContainer).success(storage.clear);
        });
    };
});
