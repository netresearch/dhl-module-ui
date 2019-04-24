define([
    'underscore',
    'uiCollection',
    'uiLayout',
    'Dhl_Ui/js/action/checkout/shipping-option/generate-input-components'
], function (_, Component, layout, generateInputs) {
    'use strict';

    return Component.extend({
        /**
         * @property {DhlShippingOption} shippingOption
         */
        shippingOption: {},

        /**
         * @property {string} shippingOptionCode
         */
        shippingOptionCode: '',

        defaults: {
            template: "Dhl_Ui/checkout/shipping-option",
            label: '${ $.shippingOption.label }',
            validateWholeGroup: false,
            visible: true,
        },

        /**
         * Initializes observable properties of instance
         */
        initObservable: function () {
            return this._super().observe('visible');
        },

        /**
         * @constructor
         */
        initialize: function () {
            this._super();

            generateInputs(this.shippingOption, this.name);
        },

        /**
         * Update shipping option visibility everytime a child is added or a child changes visibility.
         *
         * @param {Object} input
         * @protected
         */
        initElement: function (input) {
            this._super();

            this.updateVisibility();
            input.visible.subscribe(this.updateVisibility.bind(this));
        },

        /**
         * Hide the shipping option if all it's children are hidden.
         *
         * @private
         */
        updateVisibility: function () {
            var visibleInputFound = !!_.find(
                this.elems(),
                function (input) {
                    return input.visible();
                }
            );
            this.visible(visibleInputFound);
        }
    });
});
