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
        },

        initialize: function () {
            this._super();

            generateServiceInputs(this.service, this.name)
        },
    });
});
