define([
    'underscore',
    'uiLayout',
    'Dhl_Ui/js/model/checkout/shipping-option/validation-map',
    'Dhl_Ui/js/model/checkout/shipping-option/selections',
    'Dhl_Ui/js/model/checkout/shipping-option/input-templates'
], function (_, layout, validationMap, selections, inputTemplates) {
    'use strict';

    /**
     * @param {DhlInput} shippingOptionInput
     */
    var buildValidationData = function (shippingOptionInput) {
        debugger;
        var validationData = {};
        _.each(shippingOptionInput.validation_rules, function (rule) {
            var validatorName = validationMap.getValidatorName(rule.name);
            if (validatorName) {
                validationData[validatorName] = rule.param;
            } else {
                console.warn('DHL shipping option validation rule ' + rule.name + ' is not defined.');
            }
        });

        return validationData;
    };

    /**
     * Load default shipping option input value either from cache or from Input model.
     *
     * @param {DhlShippingOption} shippingOption
     * @param {DhlInput} shippingOptionInput
     * @return {string}
     */
    var getDefaultValue = function (shippingOption, shippingOptionInput) {
        var cachedValue = selections.getShippingOptionValue(
            shippingOption.code,
            shippingOptionInput.code
        );
        if (cachedValue !== null) {
            return cachedValue;
        }

        return shippingOptionInput.default_value;
    };

    /**
     * @param {DhlShippingOption} shippingOption
     * @param {string} parentName
     */
    return function (shippingOption, parentName) {
        var shippingOptionInputLayout = _.map(
            shippingOption.inputs,
            /** @type {DhlInput} */
            function (shippingOptionInput) {
                return {
                    component: 'Dhl_Ui/js/view/checkout/shipping-option-input',
                    parent: parentName,
                    shippingOptionInput: shippingOptionInput,
                    shippingOption: shippingOption,
                    shippingOptionCode: shippingOption.code,
                    inputCode: shippingOptionInput.code,
                    inputType: shippingOptionInput.input_type,
                    options: shippingOptionInput.options,
                    tooltip: shippingOptionInput.tooltip ? {description: shippingOptionInput.tooltip} : false,
                    comment: shippingOptionInput.comment,
                    elementTmpl: inputTemplates.get(shippingOptionInput.input_type),
                    value: getDefaultValue(shippingOption, shippingOptionInput),
                    validation: buildValidationData(shippingOptionInput),
                };
            }
        );

        layout(shippingOptionInputLayout);
    }
});
