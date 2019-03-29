define([
    'underscore',
    'uiCollection',
    'uiLayout',
    'Dhl_Ui/js/action/checkout/generate-service-inputs'
], function (_, Component, layout, generateServiceInputs) {
    'use strict';

    return Component.extend({
        /**
         * @property {DhlService} service
         */
        service: {},

        /**
         * @property {string} serviceCode
         */
        serviceCode: '',

        defaults: {
            template: "Dhl_Ui/checkout/service",
            label: '${ $.service.label }',
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

            generateServiceInputs(this.service, this.name);
        },

        /**
         * Update service visibility everytime a child is added or a child changes visibility.
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
         * Hide the service if all it's children are hidden.
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
