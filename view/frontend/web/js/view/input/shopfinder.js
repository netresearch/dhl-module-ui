define([
    "jquery",
    "Dhl_Ui/js/view/shipping-option-input",
    "Dhl_Ui/js/action/checkout/webapi/get-locations",
    "Dhl_Ui/js/model/map",
    "Magento_Checkout/js/model/quote",
    "Magento_Ui/js/modal/modal"
], function ($, Component, getLocations, map, quote) {
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
            map.init(this.modalMapId, 0.0, 0.0, 13);
            getLocations(
                quote.shippingMethod().carrier_code,
                {
                    country: 'country',
                    postal_code: '1235',
                    city: 'city',
                    street: 'street'
                }
            ).then(/** @param {DhlLocation[]} locations */ function (locations) {
                map.setLocations(locations);
            });
        }
    });
});
