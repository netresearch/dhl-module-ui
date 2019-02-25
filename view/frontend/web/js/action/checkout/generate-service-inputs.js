define([
    'underscore',
    'uiLayout',
    'Dhl_Ui/js/model/checkout/service/validation-map',
    'Dhl_Ui/js/action/service/resolve-input-template'
], function (_, layout, serviceValidationMap, resolveInputTemplate) {
    'use strict';

    /**
     * @param {DhlInput} serviceInput
     */
    var buildValidationData = function (serviceInput) {
        var validationData = {};
        _.each(serviceInput.validation_rules, function (rule) {
            var validatorName = serviceValidationMap.getValidatorName(rule.name);
            if (validatorName) {
                validationData[validatorName] = rule.params;
            } else {
                console.warn('DHL service validation rule ' + rule.name + ' is not defined.');
            }
        });

        return validationData;
    };

    /**
     * @var {DhlService} service
     * @var {string} parentName
     */
    return function (service, parentName) {
        var serviceInputLayout = _.map(
            service.inputs,
            /**
             * @param {DhlInput} serviceInput
             * @return {Object}
             */
            function (serviceInput) {
                if (!service.enabled_for_checkout) {
                    return;
                }
                return {
                    parent: parentName,
                    serviceInput: serviceInput,
                    service: service,
                    inputCode: serviceInput.code,
                    component: 'Dhl_Ui/js/view/checkout/service-input',
                    inputType: serviceInput.input_type,
                    elementTmpl: resolveInputTemplate(serviceInput.input_type),
                    tooltip: serviceInput.tooltip ? {description: serviceInput.tooltip} : false,
                    comment: serviceInput.comment,
                    value: serviceInput.default_value,
                    validation: buildValidationData(serviceInput),
                };
            }
        );

        layout(serviceInputLayout);
    }
});
