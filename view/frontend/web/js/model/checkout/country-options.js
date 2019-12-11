define([
    'underscore',
    'Dhl_Ui/js/model/shipping-settings',
    'Magento_Customer/js/customer-data'
], function (_, checkoutData,  customerData) {
    'use strict';

    /**
     * Create array of options objects for country select
     *
     * @param {string[]} countryCodes
     * @returns {{countryCode: string, countryName: string}[]}
     */
    var createOptions = function (countryCodes) {
        var countryData = customerData.get('directory-data')(),
            allCountryCodes = Object.keys(countryData),
            options = [];

        countryCodes = _.intersection(countryCodes, allCountryCodes);

        if (_.isEmpty(countryCodes)) {
            countryCodes = allCountryCodes;
        }

        _.each(countryCodes, function (countryId) {
            options.push({
                'countryCode': countryId,
                'countryName': countryData[countryId].name
            });
        });

        return options;
    };

    return {
        /**
         * Get country select options
         *
         * @param {string} carrierName
         * @param {string} shippingOptionCode
         * @return {{countryCode: string, countryName: string}[]}
         */
        get: function (carrierName, shippingOptionCode) {
            var settings = checkoutData.getByCarrier(carrierName),
                serviceOptions = _.findWhere(settings.service_options, {code: shippingOptionCode}),
                routes = serviceOptions.routes,
                includes = [];

            _.each(routes, /** @property {DhlShippingRoute} route */ function (route) {
                includes = includes.concat(_.difference(
                    route.include_destinations,
                    route.exclude_destinations
                ));
            });

            return createOptions(_.uniq(includes));
        }
    };
});
