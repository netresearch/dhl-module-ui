define([
    'underscore',
    'uiLayout',
    'Dhl_Ui/js/model/checkout/service/validation-map',
    'Dhl_Ui/js/model/checkout/service/service-selections',
    'Dhl_Ui/js/action/service/resolve-input-template'
], function (_, layout, serviceValidationMap, serviceSelections, resolveInputTemplate) {
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
     * Load default service input value either from cache or from Input model.
     *
     * @param {DhlService} service
     * @param {DhlInput} serviceInput
     * @return {string}
     */
    var getDefaultValue = function (service, serviceInput) {
        var cachedValue = serviceSelections.getServiceValue(
            service.code,
            serviceInput.code
        );
        if (cachedValue !== null) {
            return cachedValue;
        }

        return serviceInput.default_value;
    };

    /**
     * @var {DhlService} service
     * @var {string} parentName
     */
    return function (service, parentName) {
        var serviceInputLayout = _.map(
            service.inputs,
            /** @type {DhlInput} */
            function ( serviceInput) {
                if (!service.enabled_for_checkout) {
                    return;
                }
                return {
                    component: 'Dhl_Ui/js/view/checkout/service-input',
                    parent: parentName,
                    serviceInput: serviceInput,
                    service: service,
                    inputCode: serviceInput.code,
                    inputType: serviceInput.input_type,
                    tooltip: serviceInput.tooltip ? {description: serviceInput.tooltip} : false,
                    comment: serviceInput.comment,
                    elementTmpl: resolveInputTemplate(serviceInput.input_type),
                    value: getDefaultValue(service, serviceInput),
                    validation: buildValidationData(serviceInput),
                };
            }
        );

        layout(serviceInputLayout);
    }
});
