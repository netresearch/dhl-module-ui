define([
    'jquery',
    'Dhl_Ui/js/view/shipping-option-input',
    'Dhl_Ui/js/action/checkout/webapi/get-locations',
    'Dhl_Ui/js/model/checkout/country-options',
    'Dhl_Ui/js/model/map',
    'Dhl_Ui/js/model/current-carrier',
    'Dhl_Ui/js/model/shipping-option/selections',
    'Magento_Ui/js/modal/modal',
    'Magento_Checkout/js/model/quote'
], function ($, Component, getLocations, countryOptions,  map, currentCarrier, selections, modal, quote) {
    'use strict';

    return Component.extend({
        defaults: {
            modal: null,
            modalId: "modal-shopfinder",
            modalMapId: "modal-shopfinder-map",
            buttonLabel: '${ $.shippingOptionInput.label }',
            selectedLocation: null,
            searchCity: null,
            searchStreet: null,
            searchZip: null,
            searchCountry: null,
            errorMessage: '',
            listens: {
                selectedLocation: "updateSelections"
            }
        },

        initObservable: function () {
            this._super();
            this.observe([
                'selectedLocation',
                'searchCity',
                'searchStreet',
                'searchZip',
                'searchCountry',
                'errorMessage'
            ]);

            return this;
        },

        initialize: function () {
            var address;

            this._super();

            address = quote.shippingAddress();
            this.searchCity(address.city);
            this.searchCountry(address.countryId);
            this.searchStreet(address.street.join(' '));
            this.searchZip(address.postcode);
            this.selectedLocation(this.initSelectedLocation());

            return this;
        },

        /**
         * Try to create a basic initial location object from selection data
         * or set to null.
         *
         * @return {DhlLocation|null}
         */
        initSelectedLocation: function () {
            if (selections.getShippingOptionValue(this.shippingOption.code, this.shippingOptionInput.code)) {
                return {
                    'shop_name': selections.getShippingOptionValue(this.shippingOption.code, 'company'),
                    'address': {
                        'street': selections.getShippingOptionValue(this.shippingOption.code, 'street'),
                        'postal_code': selections.getShippingOptionValue(this.shippingOption.code, 'postalCode'),
                        'city': selections.getShippingOptionValue(this.shippingOption.code, 'city')
                    }
                };
            }

            return null;
        },

        /**
         * Initialize the shopfinder modal als jQuery UI plugin.
         * Method is executed from template on afterRender event
         * to make sure the container is available in the DOM.
         */
        initModal: function () {
            this.modal = modal(
                {responsive: true, buttons: []},
                $('#' + this.modalId)
            );
        },

        /**
         * Make sure to deinitialize the modal on destroy
         *
         * @param {Boolean} skipUpdate
         */
        destroy: function (skipUpdate) {
            if (this.modal) {
                this.modal.modal.remove();
            }

            this._super(skipUpdate);
        },

        /**
         * Update the selections model when the selectedLocation changes
         *
         * @param {DhlLocation|null} location
         */
        updateSelections: function (location) {
            if (location === null || !location.shop_id) {
                this.value(false);
                selections.removeSelection(this.shippingOption.code, 'locationType');
                selections.removeSelection(this.shippingOption.code, 'locationNumber');
                selections.removeSelection(this.shippingOption.code, 'company');
                selections.removeSelection(this.shippingOption.code, 'street');
                selections.removeSelection(this.shippingOption.code, 'postalCode');
                selections.removeSelection(this.shippingOption.code, 'city');
                selections.removeSelection(this.shippingOption.code, 'countryCode');
                selections.removeSelection(this.shippingOption.code, 'locationId');
            } else {
                this.value(true);
                selections.addSelection(this.shippingOption.code, 'locationType', location.shop_type);
                selections.addSelection(this.shippingOption.code, 'locationNumber', location.shop_number);
                selections.addSelection(this.shippingOption.code, 'company', location.shop_name);
                selections.addSelection(this.shippingOption.code, 'street', location.address.street);
                selections.addSelection(this.shippingOption.code, 'postalCode', location.address.postal_code);
                selections.addSelection(this.shippingOption.code, 'city', location.address.city);
                selections.addSelection(this.shippingOption.code, 'countryCode', location.address.country_code);
                selections.addSelection(this.shippingOption.code, 'locationId', location.shop_id);
            }
        },

        /**
         * @public
         * @param {DhlLocation} location
         */
        selectLocation: function (location) {
            this.selectedLocation(location);
            if (this.modal) {
                this.modal.closeModal();
            }
        },

        /**
         * Reset selected location
         */
        removeLocation: function () {
            this.selectedLocation(null);
        },

        /**
         * Open the modal, initialize the map and load locations.
         */
        openModal: function () {
            this.modal.openModal();
            map.init(this.modalMapId, 51.163375, 10.447683, 6);
            this.updateLocations();
        },

        /**
         * update locations
         */
        updateLocations: function () {
            this.errorMessage('');
            getLocations(
                currentCarrier.get(),
                {
                    country_code: this.searchCountry(),
                    postal_code: this.searchZip(),
                    city: this.searchCity(),
                    street: this.searchStreet()
                }
            )
            .done(/** @param {DhlLocation[]} locations */ function (locations) {
                map.setLocations(locations);
            })
            .fail(function (response) {
                this.errorMessage(response.responseJSON.message);
            }.bind(this));
        },

        getCountryOptions: function () {
            var shippingMethod = quote.shippingMethod(),
                carrierCode = shippingMethod.carrier_code;
            var options = countryOptions.get(carrierCode, this.shippingOptionCode);

            return options;
        }
    });
});
