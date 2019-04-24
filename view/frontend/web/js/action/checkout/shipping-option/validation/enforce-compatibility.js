define([
    'underscore',
    'uiRegistry',
    'Magento_Checkout/js/model/quote',
    'Dhl_Ui/js/model/checkout/shipping-option/selections',
    'Dhl_Ui/js/model/checkout-data',
    'Dhl_Ui/js/model/checkout/shipping-option/shipping-option-codes',
], function (_, registry, quote, shippingOptionSelections, shippingSettings, shippingOptionCodes) {
    'use strict';

    /**
     * @param {string} code
     * @param {Function} action - Callback to perform on the inputs for the shipping option code.
     */
    var doActionOnInputComponents = function (code, action) {
        if (!shippingOptionCodes.isCompoundCode(code)) {
            /** Unwrap shippingOptionCode into compound codes. */
            var codes = shippingOptionCodes.convertToCompoundCodes(code);
            _.each(codes, function (code) {
                doActionOnInputComponents(code, action);
            });
        } else {
            /** Modify specific input defined by compound code */
            registry.get({
                component: 'Dhl_Ui/js/view/checkout/shipping-option-input',
                shippingOptionCode: shippingOptionCodes.getShippingOptionCode(code),
                inputCode: shippingOptionCodes.getInputCode(code),
            }, action);
        }
    };

    /**
     * @param {DhlCompatibility} rule
     * @param {ActionLists} actionLists
     */
    var processIncompatibility = function (rule, actionLists) {
        var affectedOptions = rule.subjects,
            selectedOptions = _.intersection(
                _.union(rule.subjects, rule.masters),
                shippingOptionSelections.getSelectionsInCompoundFormat()
            );

        if (selectedOptions.length) {
            affectedOptions = _.difference(
                rule.subjects,
                selectedOptions
            );
        }
        var list = rule.hide_subjects
            ? (selectedOptions.length ? 'hide' : 'show')
            : (selectedOptions.length ? 'disable' : 'enable');

        actionLists[list] = _.union(actionLists[list], affectedOptions);
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
        var masters = shippingOptionCodes.convertToCompoundCodes(rule.masters),
            subjects = _.difference(
                shippingOptionCodes.convertToCompoundCodes(rule.subjects),
                masters
            );

        var selectedMasters = _.intersection(
            masters,
            shippingOptionSelections.getSelectionsInCompoundFormat()
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

    var enforceShippingOptionCompatibility = function () {
        var carrierData = shippingSettings.getByCarrier(quote.shippingMethod().carrier_code);
        if (carrierData) {
            var actionLists = processRules(carrierData.compatibility_data),
                valuesHaveChanged = false;

            /** Don't enable/show shipping options that another rule will disable/hide */
            actionLists.enable = _.difference(actionLists.enable, actionLists.disable);
            actionLists.show = _.difference(actionLists.show, actionLists.hide);

            /** Set disabled/visible status of individual shipping option inputs */
            _.each(_.uniq(actionLists.enable), function (shippingOptionCode) {
                doActionOnInputComponents(shippingOptionCode, function (input) {
                    input.disabled(false);
                });
            });
            _.each(_.uniq(actionLists.disable), function (shippingOptionCode) {
                doActionOnInputComponents(shippingOptionCode, function (input) {
                    input.disabled(true);
                    if (input.value() !== '') {
                        input.value('');
                        valuesHaveChanged = true;
                    }
                });
            });
            _.each(_.uniq(actionLists.hide), function (shippingOptionCode) {
                doActionOnInputComponents(shippingOptionCode, function (input) {
                    input.visible(false);
                    if (input.value() !== '') {
                        input.value('');
                        valuesHaveChanged = true;
                    }
                });
            });
            _.each(_.uniq(actionLists.show), function (shippingOptionCode) {
                doActionOnInputComponents(shippingOptionCode, function (input) {
                    input.visible(true);
                });
            });

            /** Re-run the compatibility enforcer until all data is consistent. */
            if (valuesHaveChanged) {
                enforceShippingOptionCompatibility();
            }
        }
    };

    /**
     * Check for unavailable shipping option combinations,
     * disable shipping option inputs that should not be filled,
     * and reenable inputs that are again available.
     */
    return enforceShippingOptionCompatibility;
});
