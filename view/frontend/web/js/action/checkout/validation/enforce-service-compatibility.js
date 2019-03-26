define([
    'underscore',
    'uiRegistry',
    'Magento_Checkout/js/model/quote',
    'Dhl_Ui/js/model/checkout/service/service-selections',
    'Dhl_Ui/js/model/shipping-settings',
    'Dhl_Ui/js/model/checkout/service/service-codes',
], function (_, registry, quote, serviceSelections, shippingSettings, serviceCodes) {
    'use strict';

    /**
     * In-between storage for compatibility results.
     *
     * @type {string[]}
     */
    var servicesToDisable = [];

    /**
     * In-between storage for compatibility results.
     *
     * @type {string[]}
     */
    var servicesToEnable = [];

    /**
     * @param {string} serviceCode
     * @param {boolean} newValue
     */
    var setServiceDisabled = function (serviceCode, newValue) {
        if (serviceCodes.isCompoundCode(serviceCode)) {
            /** Modify specific input defined by compound code */
            var element = registry.get({
                component: 'Dhl_Ui/js/view/checkout/service-input',
                serviceCode: serviceCodes.getServiceCode(serviceCode),
                inputCode: serviceCodes.getInputCode(serviceCode),
            });
            element.disabled(newValue);
        } else {
            /** Modify entire service */
            var component = registry.get({
                component: 'Dhl_Ui/js/view/checkout/service',
                serviceCode: serviceCode
            });
            _.each(component.elems(), function (element) {
                element.disabled(newValue);
            });
        }
    };

    /**
     * @param {DhlCompatibility} rule
     */
    var processRule = function (rule) {
        if (rule.incompatibility_rule) {
            var servicesWithCompatibilityData = _.intersection(
                rule.subjects,
                serviceSelections.getServiceValuesInCompoundFormat()
            );
            if (servicesWithCompatibilityData.length > 0) {
                var servicesToBeDisabled = _.difference(
                    rule.subjects,
                    servicesWithCompatibilityData
                );
                servicesToDisable = servicesToDisable.concat(servicesToBeDisabled);
            } else {
                servicesToEnable = servicesToEnable.concat(rule.subjects);
            }
        }
    };

    /**
     * Check for unavailable service combinations,
     * disable service inputs that should not be filled,
     * and reenable inputs that are again available.
     */
    return function () {
        var carrierData = shippingSettings.getByCarrier(quote.shippingMethod().carrier_code);
        if (carrierData) {
            /** Generate servicesToEnable and servicesToDisable lists */
            _.each(carrierData.service_compatibility_data, processRule);

            /** Don't enable services that another rule still disables */
            servicesToEnable = _.difference(servicesToEnable, servicesToDisable);

            /** Set disabled status of individual service inputs */
            _.each(_.uniq(servicesToEnable), function (serviceCode) {
                setServiceDisabled(serviceCode, false)
            });
            _.each(_.uniq(servicesToDisable), function (serviceCode) {
                setServiceDisabled(serviceCode, true)
            });

            /** Reset lists */
            servicesToEnable = [];
            servicesToDisable = [];
        }
    };
});
