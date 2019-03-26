define([
    'underscore',
    'ko',
    'Magento_Checkout/js/model/quote',
    'Dhl_Ui/js/model/checkout/storage'
], function (_, ko, quote, storage) {
    'use strict';

    return {
        /**
         * Determine if a service code is a dot-separated compound code
         * with a service code and an input code.
         *
         * @param {string} serviceCode
         * @return {boolean}
         */
        isCompoundCode: function (serviceCode) {
            return serviceCode.indexOf('.') !== -1;
        },

        /**
         * Retrieve only the service code from a possible compound code.
         *
         * @param {string} serviceCode
         * @return {string}
         */
        getServiceCode: function (serviceCode) {
            if (!this.isCompoundCode(serviceCode)) {
                return serviceCode;
            }
            return serviceCode.split('.')[0];
        },

        /**
         * Retrieve only the input code from a compound code.
         *
         * @param {string}serviceCode
         * @return {string|boolean} - Will return false if input is no dot-separated compound code.
         */
        getInputCode: function (serviceCode) {
            if (!this.isCompoundCode(serviceCode)) {
                return false;
            }
            return serviceCode.split('.')[1];
        }
    };
});
