define([
    'underscore',
    'ko',
    'Magento_Checkout/js/model/quote',
    'Dhl_Ui/js/model/shipping-settings',
], function (_, ko, quote, shippingSettings) {
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
         * @param {string|string[]} serviceCode
         * @return {string[]}
         */
        convertToCompoundCodes: function (serviceCode) {
            if (_.isArray(serviceCode)) {
                var result = [];
                _.each(serviceCode, function (serviceCode) {
                    result = result.concat(this.convertToCompoundCodes(serviceCode));
                }.bind(this));

                return result
            }
            if (this.isCompoundCode(serviceCode)) {
                return [serviceCode];
            }
            var shippingData = shippingSettings.getByCarrier(quote.shippingMethod().carrier_code);
            var serviceData = _.findWhere(shippingData.service_data, {'code': serviceCode});
            var inputCodes = _.pluck(serviceData.inputs, 'code');
            return _.map(inputCodes, function (inputCode) {
                return [serviceCode, inputCode].join('.');
            });

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
