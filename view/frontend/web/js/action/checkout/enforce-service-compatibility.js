define([
    'underscore',
    'uiRegistry',
    'Magento_Checkout/js/model/quote',
    'Dhl_Ui/js/model/checkout/service/service-selections',
    'Dhl_Ui/js/model/checkout/checkout-data',
], function (_, registry, quote, serviceSelections, checkoutData) {
    'use strict';

    /**
     * @param {string} serviceCode
     * @param {boolean} shouldBeDisabled
     */
    var toggleServiceDisabled = function (serviceCode, shouldBeDisabled) {

        var component = registry.get({
            component: 'Dhl_Ui/js/view/checkout/service',
            serviceCode: serviceCode
        });
        _.each(component.elems(), function (element) {
            element.disabled(shouldBeDisabled);
        });
    };

    /**
     * @param {string} serviceCode
     */
    var disableService = function (serviceCode) {
        toggleServiceDisabled(serviceCode, true)
    };

    /**
     * @param {string} serviceCode
     */
    var enableService = function (serviceCode) {
        toggleServiceDisabled(serviceCode, false)
    };

    /**
     * @param {DhlCompatibility} rule
     */
    var processRule = function (rule) {
        if (rule.incompatibility_rule) {
            var servicesWithCompatibilityData = _.intersection(
                rule.subjects,
                Object.keys(serviceSelections.get()())
            );
            if (servicesWithCompatibilityData.length > 0) {
                var servicesToBeDisabled = _.difference(
                    rule.subjects,
                    servicesWithCompatibilityData
                );
                _.each(servicesToBeDisabled, disableService);
            } else {
                _.each(rule.subjects, enableService);
            }
        }
    };

    /**
     * Check for unavailable service combinations disable service Inputs that should not be filled.
     */
    return function () {
        var carrierData = checkoutData.getByCarrier(quote.shippingMethod().carrier_code);
        if (carrierData) {
            _.each(carrierData.service_compatibility_data, processRule);
        }
    };
});
