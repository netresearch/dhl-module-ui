define([
    'Magento_Ui/js/form/element/abstract',
    'Dhl_Ui/js/model/checkout/footnotes',
    'Dhl_Ui/js/model/checkout/service/service-selections',
    'Dhl_Ui/js/action/checkout/validation/enforce-service-compatibility',
], function (Component, footnotes, serviceSelections, enforceServiceCompatibility) {
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

        defaults: {
            template: 'Dhl_Ui/checkout/form/field',
            serviceCode: '',
            inputCode: '${ $.serviceInput.code }',
            elementTmpl: '',
            value: '',
            comment: {},
            label: '${ $.serviceInput.label }',
            labelVisible: '${ $.serviceInput.label_visible }',
            description: '${ $.serviceInput.label }',
            inputName: '${ $.serviceInput.code }',
            autocomplete: '${ $.serviceInput.code }',
            placeholder: '${ $.serviceInput.placeholder }',
        },

        /**
         * Update the serviceSelections model and trigger additional validation.
         * Automatically executed when this.value changes.
         *
         * @param {string} newValue
         */
        onUpdate: function (newValue) {
            this._super();

            if (newValue) {
                serviceSelections.addService(
                    this.service.code,
                    this.serviceInput.code,
                    newValue
                );
            } else {
                serviceSelections.removeService(
                    this.service.code,
                    this.serviceInput.code
                );
            }
            enforceServiceCompatibility();
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
