define([
    'Magento_Ui/js/form/element/abstract',
    'Dhl_Ui/js/model/shipping-option/selections',
    'Dhl_Ui/js/action/shipping-option/validation/enforce-compatibility',
], function (Component, selections, enforceCompatibility) {
    'use strict';

    return Component.extend({
        /**
         * @property {DhlShippingOption} shippingOption
         */
        shippingOption: {},

        /**
         * @property {DhlInput} shippingOptionInput
         */
        shippingOptionInput: {},

        defaults: {
            template: 'Dhl_Ui/form/field',
            shippingOptionCode: '',
            inputCode: '${ $.shippingOptionInput.code }',
            elementTmpl: '',
            value: '',
            comment: {},
            label: '${ $.shippingOptionInput.label }',
            labelVisible: '${ $.shippingOptionInput.label_visible }',
            description: '${ $.shippingOptionInput.label }',
            inputName: '${ $.shippingOptionInput.code }',
            autocomplete: '${ $.shippingOptionInput.code }',
            placeholder: '${ $.shippingOptionInput.placeholder }',
        },

        initialize: function () {
            var value = selections.getShippingOptionValue(this.shippingOption.code, this.shippingOptionInput.code);
            if (value !== null) {
                this.value(value);
            }
            this._super();
        },

        /**
         * Update the shipping option selections model and trigger additional validation.
         * Automatically executed when this.value changes.
         *
         * @protected
         * @param {string} newValue
         */
        onUpdate: function (newValue) {
            this._super();

            if (newValue) {
                selections.addSelection(this.shippingOption.code, this.shippingOptionInput.code, newValue);
            } else {
                selections.removeSelection(this.shippingOption.code, this.shippingOptionInput.code);
            }
            enforceCompatibility();
        },

        /**
         * @return {boolean}
         */
        showAsterisk: function () {
            return false;
        }
    });
});
