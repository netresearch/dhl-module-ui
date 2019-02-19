define([
    'underscore',
    'uiCollection',
    'uiLayout',
    'Dhl_Ui/js/action/checkout/generate-service-inputs'
], function (_, Component, layout, generateServiceInputs) {
    'use strict';

    return Component.extend({
        defaults: {
            template: "Dhl_Ui/checkout/service",
            service: {},
            label: '${ $.service.label }',
            validateWholeGroup: false,
        },

        initialize: function () {
            this._super();

            generateServiceInputs(this.service, this.name)
        },

        /**
         * Initiates validation of its' children components.
         *
         * @returns {Array} An array of validation results.
         */
        validate: function () {
            var elems;

            this.allValid = true;

            elems = this.elems.sortBy(function (elem) {
                return !elem.active();
            });

            elems = elems.map(this._validate, this);

            return _.flatten(elems);
        },
    });
});
