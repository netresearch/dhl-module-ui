define([
    'jquery',
    'Dhl_Ui/js/view/shipping-option-input',
    'Dhl_Ui/js/action/checkout/webapi/get-locations',
    'Dhl_Ui/js/model/map',
    'Dhl_Ui/js/model/current-carrier',
    'Dhl_Ui/js/model/shipping-option/selections',
    'Magento_Ui/js/modal/modal'
], function ($, Component, getLocations, map, currentCarrier, selections, modal) {
    'use strict';

    return Component.extend({
        defaults: {
            modal: null,
            modalId: "modal-shopfinder",
            modalMapId: "modal-shopfinder-map",
            buttonLabel: '${ $.shippingOptionInput.label }',
            selectedLocation: null
        },

        initObservable: function () {
            this._super();
            this.observe('selectedLocation');
            return this;
        },

        /**
         * Initialize the shopfinder modal als jQuery UI plugin.
         * Method is executed from template on afterRender event
         * to make sure the container is available in the DOM.
         */
        initModal: function () {
            this.selectedLocation(
                {
                    'shop_name': selections.getShippingOptionValue(this.shippingOption.code, 'shop-name'),
                    'address': {
                        'street': selections.getShippingOptionValue(this.shippingOption.code, 'address-street'),
                        'postal_code': selections.getShippingOptionValue(this.shippingOption.code, 'address-postalcode'),
                        'city': selections.getShippingOptionValue(this.shippingOption.code, 'address-city'),
                    }
                }
            );
            this.modal = modal(
                {
                    trigger: '[data-trigger=showShopfinder]',
                    responsive: true,
                    opened: this.onOpen.bind(this),
                    buttons: []
                },
                $('#' + this.modalId)
            );
        },

        /**
         * @param {DhlLocation} location
         */
        selectLocation: function (location) {
            this.selectedLocation(location);

            selections.addSelection(this.shippingOption.code, 'shop-name', location.shop_name);
            selections.addSelection(this.shippingOption.code, this.shippingOptionInput.code, location.shop_id);
            selections.addSelection(this.shippingOption.code, 'address-street', location.address.street);
            selections.addSelection(this.shippingOption.code, 'address-postalcode', location.address.postal_code);
            selections.addSelection(this.shippingOption.code, 'address-city', location.address.city);
            selections.addSelection(this.shippingOption.code, 'address-country', location.address.country);

            if (this.modal) {
                this.modal.closeModal();
            }
        },

        /**
         * Initialize the map and load locations when opening the modal
         */
        onOpen: function () {
            map.init(this.modalMapId, 0.0, 0.0, 13);
            getLocations(
                currentCarrier.get(),
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
