define([
    'underscore',
    'uiLayout',
    'Dhl_Ui/js/model/checkout/service/validation-map',
    'Dhl_Ui/js/action/checkout/resolve-input-template'
], function (_, layout, serviceValidationMap, resolveInputTemplate) {
    'use strict';

    /**
     * @param {{validation_rules: {name: string, params: *[]}}} serviceInput
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
     * @var {object} service
     * @var {string} parentName
     */
    return function (service, parentName) {
        var serviceInputLayout = _.map(service.inputs, function (serviceInput) {
            return {
                parent: parentName,
                serviceInput: serviceInput,
                service: service,
                component: 'Dhl_Ui/js/view/checkout/service-input',
                inputType: serviceInput.input_type,
                elementTmpl: resolveInputTemplate(serviceInput.input_type),
                tooltip: serviceInput.tooltip ? {description: serviceInput.tooltip} : false,
                comment: serviceInput.comment,
                value: serviceInput.value,
                validation: buildValidationData(serviceInput),
            };

        }, this);

        layout(serviceInputLayout);
    }
});
