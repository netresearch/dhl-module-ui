define([
    'ko',
], function (ko) {
    'use strict';

    var checkoutData = ko.observable({});

    /**
     * @type {Object}
     */
    return {
        /**
         * @return {Observable}
         */
        get: function () {
            return checkoutData;
        },

        /**
         * @param {Observable} data
         */
        set: function (data) {
            checkoutData(data)
        },

        /**
         * @param {string} carrierName
         * @return {object|false}
         */
        getByCarrier: function (carrierName) {
            if ('carriers' in checkoutData() === false) {
                return false;
            }
            var carrier = checkoutData().carriers.find(function (carrier) {
                return carrier.carrier_code === carrierName;
            });

            return carrier ? carrier : false;
        }
    };
});
