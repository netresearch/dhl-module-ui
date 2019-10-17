define([
    "underscore",
    "jquery",
    "Dhl_Ui/js/view/shipping-option-input",
    "Magento_Ui/js/modal/modal"
], function (_, $, Component) {
    'use strict';

    return Component.extend({
        defaults: {
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
            $('#modal-shopfinder').modal({
                trigger: '[data-trigger=showShopfinder]',
                type: 'slide',
                responsive: true,
                clickableOverlay: true,
                buttons: [],
                closed: this.onClose,
                opened: this.onOpen,
            });
        },

        onClose: function () {
            this.modalOpen = false;
        },

        onOpen: function () {
            this.modalOpen = true;
        }
    });
});
