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
            itemId: false,
            additionalClasses: '${ $.shippingOptionInput.code }',
            section: '',
            disabled: '${ $.shippingOptionInput.disabled }'
        },

        initialize: function () {
            this._super();

            var value = selections.getShippingOptionValue(this.section, this.shippingOption.code, this.shippingOptionInput.code, this.itemId);
            if (value !== null) {
                this.value(value);
            } else if (this.value() !== '') {
                selections.addSelection(this.section, this.shippingOption.code, this.shippingOptionInput.code, this.itemId, this.value());
            }
        },

        /**
         * Update the shipping option selections model and trigger additional validation.
         * Automatically executed when this.value changes.
         *
         * @protected
         * @param {string|boolean} newValue
         */
        onUpdate: function (newValue) {
            this._super();

            if (newValue || newValue === false) {
                selections.addSelection(this.section, this.shippingOption.code, this.shippingOptionInput.code, this.itemId, newValue);
            } else {
                selections.removeSelection(this.section, this.shippingOption.code, this.shippingOptionInput.code, this.itemId);
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
