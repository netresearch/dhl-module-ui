define([
    'Magento_Checkout/js/model/quote'
], function (quote) {
    'use strict';

    return {
        /**
         * @return {string|boolean}     Will return false if there is no shipping method set.
         */
        get: function () {
            var shippingMethod = quote.shippingMethod();

            if (!shippingMethod) {
                return false;
            }

            return quote.shippingMethod().carrier_code;
        }
    };
});
