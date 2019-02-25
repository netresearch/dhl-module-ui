define([
    'Magento_Checkout/js/model/url-builder',
    'Magento_Customer/js/model/customer',
    'mage/storage',
    'Magento_Checkout/js/model/quote',
    'Magento_Checkout/js/model/shipping-service',
    'Dhl_Ui/js/model/checkout/storage',
    'Dhl_Ui/js/model/checkout/checkout-data'
], function (
    urlBuilder,
    customer,
    request,
    quote,
    shippingService,
    storage,
    checkoutData
) {
    'use strict';

    /**
     * @type {{date: string, checkbox: string, text: string, time: string}}
     */
    var templates = {
        text: 'ui/form/element/input',
        checkbox: 'Dhl_Ui/checkout/form/element/checkbox',
        time: 'Dhl_Ui/checkout/form/element/radio',
        date: 'Dhl_Ui/checkout/form/element/radio'
    };

    /**
     * @param {string} type
     * @return {string|false}
     */
    return function (type) {
        if (templates[type]) {
            return templates[type];
        }

        return false;
    };
});
