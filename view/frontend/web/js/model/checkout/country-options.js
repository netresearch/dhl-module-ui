define([
    'underscore',
    'ko',
    'Magento_Customer/js/customer-data',
    'Dhl_Ui/js/model/shipping-settings'
], function (_, ko, customerData, checkoutData) {
    'use strict';

    /**
     * @param {DhlCarrier} carrierData
     */
    var carrierData;

    var countryData = customerData.get('directory-data');
    var countrySelected = ko.observable();
    /**
     *
     * @param {string}[] countryCodes
     * @returns {[]}
     */
    var getOptions = function (countryCodes) {
        if (_.isEmpty(countryCodes)) {
            return;
        }
        var options = [];
        _.each(countryCodes, function (countryId) {
            var name = countryData()[countryId].name,
                option = {
                    'countryCode': countryId,
                    'countryName': name
                };
            options.push(option);
        });
        return options;
    };

    return {
        /**
         * @param {string} carrierName
         * @param {string} shippingOptionCode
         */
        get: function (carrierName, shippingOptionCode) {
            var settings = checkoutData.getByCarrier(carrierName),
                serviceOptions = settings.service_options.find(function (serviceOption) {
                    return serviceOption.code ===  shippingOptionCode;
                }),
                routes = serviceOptions.routes;
            var includes = [];

            _.each(routes, function (route) {
                if (!_.isEmpty(route.include_destinations)) {
                    _.each(route.include_destinations, function (include) {
                        includes.push(include);
                    });
                }
            });
            return getOptions(includes);
        }
    }

});
