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
     * @param {string} serviceCode
     * @param {Function} action - calback to perform on the inputs for the service code.
     */
    var doActionOnServiceInputs = function (serviceCode, action) {
        if (!serviceCodes.isCompoundCode(serviceCode)) {
            /** Unwrap serviceCode into compound codes. */
            var codes = serviceCodes.convertToCompoundCodes(serviceCode);
            _.each(codes, function (code) {
                doActionOnServiceInputs(code, action);
            });
        } else {
            /** Modify specific input defined by compound code */
            registry.get({
                component: 'Dhl_Ui/js/view/checkout/service-input',
                serviceCode: serviceCodes.getServiceCode(serviceCode),
                inputCode: serviceCodes.getInputCode(serviceCode),
            }, action);
        }
    };

    /**
     * @param {DhlCompatibility} rule
     * @param {ActionLists} actionLists
     */
    var processIncompatibility = function (rule, actionLists) {
        var affectedServices = rule.subjects,
            selectedServices = _.intersection(
                _.union(rule.subjects, rule.masters),
                serviceSelections.getServiceValuesInCompoundFormat()
            );

        if (selectedServices.length) {
            affectedServices = _.difference(
                rule.subjects,
                selectedServices
            );
        }
        var list = rule.hide_subjects
            ? (selectedServices.length ? 'hide' : 'show')
            : (selectedServices.length ? 'disable' : 'enable');

        actionLists[list] = _.union(actionLists[list], affectedServices);
    };

    /**
     *
     * @param {DhlCompatibility} rule
     * @param {ActionLists} actionLists
     */
    var processCompatibility = function (rule, actionLists) {
        if (!rule.masters.length) {
            // Compatibility rule has no masters set; skipping. It will still be evaluated on submission.
            return;
        }
        /** Masters must not be part of subjects as well */
        var masters = serviceCodes.convertToCompoundCodes(rule.masters),
            subjects = _.difference(
                serviceCodes.convertToCompoundCodes(rule.subjects),
                masters
            );

        var selectedMasters = _.intersection(
            masters,
            serviceSelections.getServiceValuesInCompoundFormat()
        );
        var list = rule.hide_subjects
            ? (selectedMasters.length ? 'show' : 'hide')
            : (selectedMasters.length ? 'enable' : 'disable');

        actionLists[list] = _.union(actionLists[list], subjects);
    };

    /**
     * @param {DhlCompatibility} rule
     * @param {ActionLists} actionLists
     */
    var processRule = function (rule, actionLists) {
        if (rule.incompatibility_rule) {
            processIncompatibility(rule, actionLists);
        } else {
            processCompatibility(rule, actionLists)
        }
    };

    /**
     *
     * @param {DhlCompatibility[]} rules
     * @return {ActionLists}
     */
    var processRules = function (rules) {
        /**
         * In-between storage for compatibility results.
         *
         * @typedef {{hide: string[], disable: string[], enable: string[], show: string[]}} ActionLists
         * @type ActionLists
         */
        var actionLists = {
            disable: [],
            enable: [],
            hide: [],
            show: [],
        };

        _.each(rules, function (rule) {
            processRule(rule, actionLists);
        });

        return actionLists;
    };

    var enforceServiceCompatitibilty = function () {
        var carrierData = shippingSettings.getByCarrier(quote.shippingMethod().carrier_code);
        if (carrierData) {
            var actionLists = processRules(carrierData.service_compatibility_data),
                valuesHaveChanged = false;

            /** Don't enable/show services that another rule will disable/hide */
            actionLists.enable = _.difference(actionLists.enable, actionLists.disable);
            actionLists.show = _.difference(actionLists.show, actionLists.hide);

            /** Set disabled/visible status of individual service inputs */
            _.each(_.uniq(actionLists.enable), function (serviceCode) {
                doActionOnServiceInputs(serviceCode, function (input) {
                    input.disabled(false);
                });
            });
            _.each(_.uniq(actionLists.disable), function (serviceCode) {
                doActionOnServiceInputs(serviceCode, function (input) {
                    input.disabled(true);
                    if (input.value() !== '') {
                        input.value('');
                        valuesHaveChanged = true;
                    }
                });
            });
            _.each(_.uniq(actionLists.hide), function (serviceCode) {
                doActionOnServiceInputs(serviceCode, function (input) {
                    input.visible(false);
                    if (input.value() !== '') {
                        input.value('');
                        valuesHaveChanged = true;
                    }
                });
            });
            _.each(_.uniq(actionLists.show), function (serviceCode) {
                doActionOnServiceInputs(serviceCode, function (input) {
                    input.visible(true);
                });
            });

            /** Re-run the compatibility enforcer until all data is consistent. */
            if (valuesHaveChanged) {
                enforceServiceCompatitibilty();
            }
        }
    };

    /**
     * Check for unavailable service combinations,
     * disable service inputs that should not be filled,
     * and reenable inputs that are again available.
     */
    return enforceServiceCompatitibilty;
});
