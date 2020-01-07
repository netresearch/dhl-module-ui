define([
    'jquery',
    'Magento_Checkout/js/model/quote'
], function ($, quote) {
    'use strict';

    var storage = $.initNamespaceStorage('dhl_shipping_data_storage').localStorage,
        quoteId = quote.getQuoteId();

    return {
        /**
         * @param {string} key
         * @return {boolean|{}}
         */
        get: function (key) {
            var data = storage.get(quoteId);

            if (data !== undefined && data[key] !== undefined) {
                return data[key];
            }
            return false;
        },
        /**
         * @param {string} key
         * @param {*} value
         */
        set: function (key, value) {
            var data = storage.get(quoteId);

            if (data === undefined) {
                data = {};
            }
            data[key] = value;
            storage.set(quoteId, data);
        },

        clear: function () {
            storage.removeAll();
        }
    };
});
