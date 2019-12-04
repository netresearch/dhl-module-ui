define([
    'underscore',
    'Magento_Customer/js/customer-data',
    'Dhl_Ui/js/model/shipping-settings'
], function (_, customerData, checkoutData) {
    'use strict';

    /**
     * @param {DhlCarrier} carrierData
     */
    var carrierData;

    /**
     *
     * @param {string}[] countryCodes
     */
    var getOptions = function (countryCodes) {
        debugger;
        var options = [];
        _.each(countryCodes, function (countryId) {
            debugger;
            var name = customerData.get('directory-data')[countryId].name,
                option = {
                    value: countryId,
                    label: name
                };
            options.push(option);
        });
        debugger;
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
            debugger;
            var options = getOptions(includes);
            debugger;
        }
    }

});
