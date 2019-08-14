define([
    'underscore',
    'ko',
    'Dhl_Ui/js/model/current-carrier',
    'Dhl_Ui/js/model/shipping-settings',
], function (_, ko, currentCarrier, shippingSettings) {
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
            var result = [],
                shippingData,
                shippingOption,
                inputCodes;

            /**
             * Handle arrays recursively.
             */
            if (_.isArray(code)) {
                _.each(code, function (singleCode) {
                    result = result.concat(this.convertToCompoundCodes(singleCode));
                }.bind(this));

                return result;
            }

            if (this.isCompoundCode(code)) {
                result.push(code);

                return result;
            }

            shippingData = shippingSettings.getByCarrier(currentCarrier.get());
            shippingOption = _.findWhere(shippingData.service_options, {'code': code});

            if (shippingOption) {
                inputCodes = _.pluck(shippingOption.inputs, 'code');
                result = _.map(inputCodes, function (inputCode) {
                    return [code, inputCode].join('.');
                });
            }

            return result;

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
