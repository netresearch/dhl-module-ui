define([
    'underscore',
    'ko',
    'Magento_Checkout/js/model/quote',
    'Dhl_Ui/js/model/checkout-data',
], function (_, ko, quote, checkoutData) {
    'use strict';

    return {
        /**
         * Determine if a shipping option code is a dot-separated compound code
         * with a shipping option code and an input code.
         *
         * @param {string} code
         * @return {boolean}
         */
        isCompoundCode: function (code) {
            return code.indexOf('.') !== -1;
        },

        /**
         * @param {string|string[]} code
         * @return {string[]}
         */
        convertToCompoundCodes: function (code) {
            if (_.isArray(code)) {
                var result = [];
                _.each(code, function (code) {
                    result = result.concat(this.convertToCompoundCodes(code));
                }.bind(this));

                return result
            }
            if (this.isCompoundCode(code)) {
                return [code];
            }
            var shippingData = checkoutData.getByCarrier(quote.shippingMethod().carrier_code);
            var shippingOption = _.findWhere(shippingData.shipping_options, {'code': code});
            var inputCodes = _.pluck(shippingOption.inputs, 'code');
            return _.map(inputCodes, function (inputCode) {
                return [code, inputCode].join('.');
            });

        },

        /**
         * Retrieve only the shipping option code from a possible compound code.
         *
         * @param {string} code
         * @return {string}
         */
        getShippingOptionCode: function (code) {
            if (!this.isCompoundCode(code)) {
                return code;
            }
            return code.split('.')[0];
        },

        /**
         * Retrieve only the input code from a compound code.
         *
         * @param {string} shippingOptionCode
         * @return {string|boolean} - Will return false if input is no dot-separated compound code.
         */
        getInputCode: function (shippingOptionCode) {
            if (!this.isCompoundCode(shippingOptionCode)) {
                return false;
            }
            return shippingOptionCode.split('.')[1];
        }
    };
});
