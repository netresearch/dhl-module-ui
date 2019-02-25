define([
    'underscore',
    'mage/translate',
    'uiRegistry',
    'Magento_Checkout/js/model/quote',
    'Dhl_Ui/js/model/checkout/checkout-data',
    'Dhl_Ui/js/model/checkout/service/service-selections',
    'Dhl_Ui/js/action/service/resolve-name',
], function (_, $t, registry, quote, checkoutData, serviceSelection, resolveName) {
    'use strict';

    /**
     * @param {DhlCompatibility} compatibility
     * @return {string}
     */
    var buildErrorMessage = function (compatibility) {
        var subjectNames = _.map(compatibility.subjects, function (subject) {
            return  '"' + resolveName(quote.shippingMethod().carrier_code, subject) + '"';
        });

        return compatibility.error_message.replace(
            '%1',
            subjectNames.join(' ' + $t('and') + ' ')
        );
    };

    /**
     * Collect all selected services and inputs in dot-separated format.
     *
     * @return {string[]}
     */
    var collectSelectedServiceCodes = function () {
        var selectedServiceCodes = [];
        _.each(serviceSelection.get()(), function (values, serviceCode) {
            selectedServiceCodes.push(serviceCode);
            _.each(values, function (value, inputCode) {
                selectedServiceCodes.push([serviceCode, inputCode].join('.'))
            })
        });

        return selectedServiceCodes;
    };

    /**
     * @param {DhlCompatibility} compatibility
     */
    var markRelatedInputsWithError = function (compatibility) {
        _.each(compatibility.subjects, function (subject) {
            var serviceInputs = [],
                codes = subject.split('.'),
                serviceCode = codes.shift(),
                inputCode = codes.shift();
            if (inputCode) {
                serviceInputs = [
                    registry.get({
                        component: 'Dhl_Ui/js/view/checkout/service-input',
                        inputCode: inputCode,
                    })
                ];
            } else {
                serviceInputs = registry.get({
                    component: 'Dhl_Ui/js/view/checkout/service',
                    serviceCode: serviceCode
                }).elems();
            }
            _.each(serviceInputs, function (input) {
                if (!input.error()) {
                    input.error(' ');
                }
            });
        });
    };

    /**
     * Is triggered by incompatibility_rule value of "true".
     *
     * @param {DhlCompatibility} compatibility
     * @param {int} serviceDifference - The number of selected services that are subjects of the compatibility rule.
     * @return {boolean}
     */
    var isIncompatibleServiceCombination = function (compatibility, serviceDifference) {
        return compatibility.incompatibility_rule && serviceDifference === 0
    };

    /**
     * Checks if there are any services selected that require another service that is missing.
     * Is triggered by incompatibility_rule value of "false".
     *
     * @param {DhlCompatibility} compatibility
     * @param {int} serviceDifference - The number of selected services that are subjects of the compatibility rule.
     * @return {boolean}
     */
    var isMissingRequiredServices = function (compatibility, serviceDifference) {
        if (!compatibility.incompatibility_rule) {
            /** Either all or none of the services may be selected. */
            return !_.contains([0, compatibility.subjects.length], serviceDifference);
        }

        return  false;
    };

    /**
     * Check for unavailable service combinations and display errors on shipping settings view.
     *
     * @return {boolean} - whether there were any compatibility errors.
     */
    return function () {
        var carrier = quote.shippingMethod().carrier_code,
            compatibilityInfo = checkoutData.getByCarrier(carrier).service_compatibility_data,
            selectedServiceCodes = collectSelectedServiceCodes(),
            shippingSettingsView = registry.get({component: 'Dhl_Ui/js/view/checkout/shipping-settings'});

        shippingSettingsView.errors([]);

        _.each(compatibilityInfo, function (compatibility) {
            var serviceDifference = _.difference(compatibility.subjects, selectedServiceCodes).length;
            if (isIncompatibleServiceCombination(compatibility, serviceDifference)
                || isMissingRequiredServices(compatibility, serviceDifference)
            ) {
                shippingSettingsView.errors.push(buildErrorMessage(compatibility));
                markRelatedInputsWithError(compatibility);
            }
        }.bind(this));

        return shippingSettingsView.errors().length === 0;
    };
});
