define([
    'underscore',
    'uiRegistry',
    'Dhl_Ui/js/model/current-carrier',
    'Dhl_Ui/js/model/shipping-option/selections',
    'Dhl_Ui/js/model/shipping-settings',
    'Dhl_Ui/js/model/shipping-option/shipping-option-codes',
], function (_, registry, currentCarrier, selections, shippingSettings, shippingOptionCodes) {
    'use strict';

    var oppositeRuleMap = {
        'hide': 'show',
        'show': 'hide',
        'disable': 'enable',
        'enable': 'disable',
        'require': 'unrequire',
        'unrequire': 'require',
    };

    /**
     * @param {string} code
     * @param {Function} action - Callback to perform on the inputs for the shipping option code.
     */
    var doActionOnInputComponents = function (code, action) {
        if (!shippingOptionCodes.isCompoundCode(code)) {
            /** Unwrap shippingOptionCode into compound codes. */
            _.each(shippingOptionCodes.convertToCompoundCodes(code), function (compoundCode) {
                doActionOnInputComponents(compoundCode, action);
            });
        } else {
            /** Modify specific input defined by compound code */
            registry.get({
                component: 'Dhl_Ui/js/view/shipping-option-input',
                shippingOptionCode: shippingOptionCodes.getShippingOptionCode(code),
                inputCode: shippingOptionCodes.getInputCode(code),
            }, action);
        }
    };

    /**
     * @param {DhlCompatibility} rule
     * @param {ActionLists} actionLists
     */
    var processRule = function (rule, actionLists) {
        var masters,
            subjects,
            selectedMasters = [],
            list;

        if (!rule.masters.length) {
            // rule has no masters set; skipping. It will still be evaluated on submission.
            return;
        }

        /** Masters must not be part of subjects as well */
        masters = shippingOptionCodes.convertToCompoundCodes(rule.masters);
        subjects = _.difference(
            shippingOptionCodes.convertToCompoundCodes(rule.subjects),
            masters
        );

        _.each(
            selections.getSelectionValuesInCompoundFormat(),
            function (selection) {
                var selectionIsMaster = masters.indexOf(selection.code) !== -1,
                    valuesMatch = function () {
                        if (rule.trigger_value === '*') {
                            // The '*' value matches any "truthy" value
                            return !!selection.value;
                        }
                        // Otherwise, we need an exact match */
                        return selection.value === rule.trigger_value;
                    }();

                if (selectionIsMaster && valuesMatch) {
                    selectedMasters.push(selection);
                }
            }
        );

        list = selectedMasters.length ? rule.action : oppositeRuleMap[rule.action];
        actionLists[list] = _.union(actionLists[list], subjects);
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
        console.warn('Enforcing shipping option selection compatibility ...');
        var carrierData = shippingSettings.getByCarrier(currentCarrier.get()),
            actionLists,
            valuesHaveChanged = false;

        if (carrierData) {
            actionLists = processRules(carrierData.compatibility_data);

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
                    if (!input.disabled()) {
                        input.disabled(true);
                        if (input.value() !== '') {
                            input.value('');
                            valuesHaveChanged = true;
                        }
                    }
                });
            });
            _.each(_.uniq(actionLists.hide), function (shippingOptionCode) {
                doActionOnInputComponents(shippingOptionCode, function (input) {
                    if (input.visible()) {
                        input.visible(false);
                        if (input.value() !== '') {
                            input.value('');
                            valuesHaveChanged = true;
                        }
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
