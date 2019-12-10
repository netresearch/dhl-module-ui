define([
    'underscore',
    'ko',
    'Dhl_Ui/js/model/shipping-settings',
    'Magento_Customer/js/customer-data'
], function (_, ko, checkoutData,  customerData) {
    'use strict';

    var countryData = customerData.get('directory-data');

    /**
     * Create array of options objects for country select
     *
     * @param {string[]} countryCodes
     * @returns {[]}
     */
    var createOptions = function (countryCodes) {
        var options = [];
        if (_.isEmpty(countryCodes)) {
            _.each(countryData(), function (name, countryId) {
                debugger;
                var option = {
                    'countryCode': countryId,
                    'countryName': name.name
                };
                options.push(option);
            });
        } else {
            _.each(countryCodes, function (countryId) {
                var name = countryData()[countryId].name,
                    option = {
                        'countryCode': countryId,
                        'countryName': name
                    };
                options.push(option);
            });
        }

        return ko.observableArray(options);
    };

    /**
     * build allowed destinations from route included and excluded destinations
     * @param {string[]} includes
     * @param {string[]} excludes
     * @return {[]}
     */
    var filterDestinations = function (includes, excludes) {
        return _.difference(includes, excludes);
    };

    return {
        /**
         * Get country select options
         * @param {string} carrierName
         * @param {string} shippingOptionCode
         * @return {*[]}
         */
        get: function (carrierName, shippingOptionCode) {
            var settings = checkoutData.getByCarrier(carrierName),
                serviceOptions = settings.service_options.find(function (serviceOption) {
                    return serviceOption.code ===  shippingOptionCode;
                }),
                routes = serviceOptions.routes,
                includes = [];

            if (_.isEmpty(routes)) {
                return createOptions([]);
            }

            _.each(routes, /** @property {DhlShippingRoute} route */ function (route) {
               includes.push(filterDestinations(route.include_destinations, route.exclude_destinations));
            });
            return createOptions(_.uniq(_.flatten(includes)));
        }
    }
});
