define([
    'Magento_Checkout/js/model/quote'
], function (quote) {
    'use strict';

    return {
        get: function () {
            return quote.shippingMethod().carrier_code;
        }
    };
});
