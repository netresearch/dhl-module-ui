define([
    'Magento_Ui/js/form/element/abstract',
    'Dhl_Ui/js/model/checkout/service/service-selections',
    'Dhl_Ui/js/model/checkout/footnotes',
], function (Component, serviceSelections, footnotes) {
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
            labelVisible: '${ $.serviceInput.label_visible }',
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
            }, this);
        },

        /**
         * @param {DhlComment} comment
         * @return {boolean}
         */
        showAsterisk: function (comment) {
            if (!comment.footnote_id) {
                return false;
            }
            return footnotes.isFootnoteVisible(comment.footnote_id);
        }
    });
});
