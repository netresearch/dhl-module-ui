define([
    'Magento_Ui/js/form/element/abstract',
    'Dhl_Ui/js/model/checkout/footnotes',
    'Dhl_Ui/js/model/checkout/shipping-option/selections',
    'Dhl_Ui/js/action/checkout/shipping-option/validation/enforce-compatibility',
], function (Component, footnotes, selections, enforceCompatibility) {
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
            template: 'Dhl_Ui/checkout/form/field',
            shippingOptionCode: '',
            inputCode: '${ $.shippingOptionInput.code }',
            elementTmpl: '',
            value: '',
            options: [],
            comment: {},
            label: '${ $.shippingOptionInput.label }',
            labelVisible: '${ $.shippingOptionInput.label_visible }',
            description: '${ $.shippingOptionInput.label }',
            inputName: '${ $.shippingOptionInput.code }',
            autocomplete: '${ $.shippingOptionInput.code }',
            placeholder: '${ $.shippingOptionInput.placeholder }',
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
