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

    /**
     *
     * @param {string[]} countryCodes
     * @returns {[]}
     */
    var getOptions = function (countryCodes) {
        if (_.isEmpty(countryCodes)) {
            return;
        }
        var options = [];
        _.each(countryCodes, function (countryId) {
            debugger;
            var name = countryData()[countryId].name,
                option = {
                    'countryCode': countryId,
                    'countryName': name
                };
            options.push(option);
        });
        return ko.observableArray(options);
    };
    /**
     *
     * @param {string[]} includes
     * @param {string[]} excludes
     * @return {[]}
     */
    var getIncludes = function (includes, excludes) {
        var result;
        if (_.isEmpty(excludes)) {
            result = checkForEu(includes);
        }
        var inclusion = checkForEu(includes);
        var exclusion = checkForEu(excludes);
        result = _.difference(inclusion, exclusion);

        return result;
    };

    var checkForEu = function (destinations) {
        var eu = _.filter(destinations, function (destination) {
            return destination === 'eu';
        });
        if (eu.length > 0) {
            return window.euCountries;
        }
        return destinations;
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
                routes = serviceOptions.routes,
                includes;

            if (_.isEmpty(routes)) {
                return;
            }
            _.each(routes, function (route) {
                /*if (!_.isEmpty(route.exlude_destinations) && !_.isEmpty(route.include_destinations)) {


                    var diff = _.union(route.exlude_destinations, route.include_destinations);
                    debugger;
                }
                if (!_.isEmpty(route.include_destinations)) {
                    _.each(route.include_destinations, function (include) {
                        includes.push(include);
                    });
                }*/
               var routeIncludes = getIncludes(route.include_destinations, route.exclude_destinations);

            });
            return getOptions(includes);
        }
    }

});
