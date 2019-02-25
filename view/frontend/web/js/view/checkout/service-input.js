define([
    'Magento_Ui/js/form/element/abstract',
    'Dhl_Ui/js/model/checkout/service/service-selections',
], function (Component, serviceSelections) {
    'use strict';


    return Component.extend({
        /**
         * @property {DhlService} service
         */
        service: {},

        /**
         * @property {DhlInput} serviceInput
         */
        serviceInput: {},

        /**
         * @property {DhlComment} comment
         */
        comment: {},


        defaults: {
            template: 'Dhl_Ui/checkout/form/field',
            inputCode: '',
            elementTmpl: '',
            value: '',
            label: '${ $.serviceInput.label }',
            description: '${ $.serviceInput.label }',
            inputName: '${ $.serviceInput.code }',
            autocomplete: '${ $.serviceInput.code }',
            placeholder: '${ $.serviceInput.placeholder }',
        },

        initialize: function () {
            this._super();

            var cachedValue = serviceSelections.getServiceValue(
                this.service.code,
                this.serviceInput.code
            );
            if (cachedValue !== null) {
                this.value(cachedValue);
            }

            this.value.subscribe(function (value) {
                if (value) {
                    serviceSelections.addService(
                        this.service.code,
                        this.serviceInput.code,
                        value
                    );
                } else {
                    serviceSelections.removeService(
                        this.service.code,
                        this.serviceInput.code
                    );
                }
                //enforceCompatibility();
                //validateCompatibility();
            }, this);
        },
    });
});
