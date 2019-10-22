define([
    "underscore",
    "jquery",
    "Dhl_Ui/js/view/shipping-option-input",
    "Dhl_Ui/js/model/map",
    "Magento_Ui/js/modal/modal"
], function (_, $, Component, map) {
    'use strict';

    return Component.extend({
        defaults: {
            modalId: "modal-shopfinder",
            modalMapId: "modal-shopfinder-map",
            buttonLabel: '${ $.shippingOptionInput.label }',
            selectedShopId: null,
            selectedShopAddress: null,
            modalOpen: false
        },

        /**
         * Initialize the shopfinder modal als jQuery UI plugin.
         * Method is executed from template on afterRender event
         * to make sure the container is available in the DOM.
         */
        initModal: function () {
            $('#' + this.modalId).modal({
                trigger: '[data-trigger=showShopfinder]',
                type: 'popup',
                responsive: true,
                clickableOverlay: true,
                buttons: [],
                closed: this.onClose.bind(this),
                opened: this.onOpen.bind(this)
            });
        },

        onClose: function () {
            this.modalOpen = false;
        },

        onOpen: function () {
            this.modalOpen = true;
            map.init(this.modalMapId, 0.0, 0.0, 13, []);
        }
    });
});
