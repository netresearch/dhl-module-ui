define([
    'underscore',
    'ko',
    'uiCollection',
    'Magento_Checkout/js/model/quote',
    'Dhl_Ui/js/model/checkout/checkout-data-refresh',
    'Dhl_Ui/js/action/checkout/generate-service-components',
    'Dhl_Ui/js/action/checkout/update-shipping-data',
    'Dhl_Ui/js/model/checkout/checkout-data'
], function (_, ko, UiCollection, quote, settingsRefresh, generateServiceComponents, updateShippingData, checkoutData) {
    'use strict';

    return UiCollection.extend({
        defaults: {
            template: 'Dhl_Ui/checkout/shipping-settings',
            error: '',
            image: '',
            title: '',
            commentsBefore: [],
            commentsAfter: [],
            visible: false
        },

        initObservable: function () {
            this._super();
            this.observe('services error image title commentsBefore commentsAfter visible');

            return this;
        },

        initialize: function () {
            this._super();

            checkoutData.get().subscribe(this.refresh, this);
            quote.shippingMethod.subscribe(this.refresh, this);

            quote.shippingAddress.subscribe(function (shippingAddress) {
                if (settingsRefresh.shouldRefresh(shippingAddress.countryId, shippingAddress.postcode)) {
                    updateShippingData(shippingAddress.countryId, shippingAddress.postcode);
                }
            });
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

        /**
         * @private
         */
        refresh: function () {
            var shippingMethod = quote.shippingMethod();
            if (!shippingMethod) {
                return;
            }
            var carrierData = checkoutData.getByCarrier(shippingMethod.carrier_code);
            if (!carrierData) {
                this.visible(false);
                return;
            }
            this.image(carrierData.service_metadata.image_url);
            this.title(carrierData.service_metadata.title);
            this.commentsBefore(carrierData.service_metadata.comments_before);
            this.commentsAfter(carrierData.service_metadata.comments_after);
            this.visible(true);

            this.destroyChildren();
            generateServiceComponents(carrierData.service_data, this.name);
            this.elems.extend({rateLimit: {timeout: 50, method: "notifyWhenChangesStop"}});
        },
    });
});
