define([
    'underscore',
    'mage/translate',
    'uiRegistry',
    'Magento_Checkout/js/model/quote',
    'Dhl_Ui/js/model/checkout-data',
    'Dhl_Ui/js/model/checkout/shipping-option/selections',
    'Dhl_Ui/js/action/shipping-option/resolve-name',
    'Dhl_Ui/js/model/checkout/shipping-option/shipping-option-codes',
], function (_, $t, registry, quote, shippingSettings, serviceSelection, resolveName, serviceCodes) {
    'use strict';

    /**
     * @param {DhlCompatibility} rule
     * @return {string}
     */
    var buildErrorMessage = function (rule) {
        var subjectNames = _.map(rule.subjects, function (subject) {
            return '"' + resolveName(quote.shippingMethod().carrier_code, subject) + '"';
        });

        return rule.error_message.replace(
            '%1',
            subjectNames.join(' ' + $t('and') + ' ')
        );
    };

    /**
     * @param {DhlCompatibility} rule
     */
    var markRelatedInputsWithError = function (rule) {
        _.each(rule.subjects, function (subject) {
            var serviceInputs = [];
            if (serviceCodes.getInputCode(subject)) {
                serviceInputs = [registry.get({
                    component: 'Dhl_Ui/js/view/checkout/shipping-option-input',
                    inputCode: serviceCodes.getInputCode(subject),
                })];
            } else {
                serviceInputs = registry.get({
                    component: 'Dhl_Ui/js/view/checkout/shipping-option',
                    serviceCode: subject
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
     * @param {DhlCompatibility} rule
     * @param {int} serviceDifference - The number of selected services that are subjects of the compatibility rule.
     * @return {boolean}
     */
    var isIncompatibleServiceCombination = function (rule, serviceDifference) {
        return rule.incompatibility_rule && serviceDifference === 0
    };

    /**
     * Checks if there are any services selected that require another service that is missing.
     * Is triggered by incompatibility_rule value of "false".
     *
     * @param {DhlCompatibility} rule
     * @param {int} serviceDifference - The number of selected services that are subjects of the compatibility rule.
     * @return {boolean}
     */
    var isMissingRequiredServices = function (rule, serviceDifference) {
        if (!rule.incompatibility_rule) {
            /** Either all or none of the services may be selected. */
            return !_.contains([0, rule.subjects.length], serviceDifference);
        }

        return false;
    };

    /**
     * Check for unavailable service combinations and display errors on shipping settings view.
     *
     * @return {boolean} - whether there were any compatibility errors.
     */
    return function () {
        var carrier = quote.shippingMethod().carrier_code,
            compatibilityInfo = shippingSettings.getByCarrier(carrier).compatibility_data,
            selectedServiceCodes = serviceSelection.getSelectionsInCompoundFormat(),
            shippingSettingsView = registry.get({component: 'Dhl_Ui/js/view/checkout/shipping-options-area'});

        shippingSettingsView.errors([]);

        _.each(compatibilityInfo, function (compatibility) {
            if (compatibility.masters.length === 0 || _.intersection(selectedServiceCodes, compatibility.masters).length) {
                var serviceDifference = _.difference(compatibility.subjects, selectedServiceCodes).length;
                if (isIncompatibleServiceCombination(compatibility, serviceDifference)
                    || isMissingRequiredServices(compatibility, serviceDifference)
                ) {
                    shippingSettingsView.errors.push(buildErrorMessage(compatibility));
                    markRelatedInputsWithError(compatibility);
                }
            }
        }.bind(this));

        return shippingSettingsView.errors().length === 0;
    };
});
