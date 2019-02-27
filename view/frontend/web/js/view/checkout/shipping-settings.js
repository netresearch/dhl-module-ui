define([
    'underscore',
    'ko',
    'uiCollection',
    'Magento_Checkout/js/model/quote',
    'Dhl_Ui/js/model/checkout/checkout-data-refresh',
    'Dhl_Ui/js/action/checkout/generate-service-components',
    'Dhl_Ui/js/action/checkout/update-shipping-data',
    'Dhl_Ui/js/model/checkout/checkout-data',
    'Dhl_Ui/js/model/checkout/service/service-selections',
    'Dhl_Ui/js/model/checkout/footnotes',
], function (
    _,
    ko,
    UiCollection,
    quote,
    settingsRefresh,
    generateServiceComponents,
    updateShippingData,
    checkoutData,
    serviceSelections,
    footnotes
) {
    'use strict';

    var carrierData;

    return UiCollection.extend({
        defaults: {
            template: 'Dhl_Ui/checkout/shipping-settings',
            errors: [],
            image: '',
            title: '',
            commentsBefore: [],
            commentsAfter: [],
            footnotes: [],
            visible: false
        },

        initObservable: function () {
            this._super();
            this.observe('services errors image title commentsBefore commentsAfter footnotes visible');

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
         * @private
         */
        refresh: function () {
            var shippingMethod = quote.shippingMethod();
            if (!shippingMethod) {
                return;
            }

            carrierData = checkoutData.getByCarrier(shippingMethod.carrier_code);
            if (!carrierData) {
                this.visible(false);
                return;
            }
            this.image(carrierData.service_metadata.image_url);
            this.title(carrierData.service_metadata.title);
            this.commentsBefore(carrierData.service_metadata.comments_before);
            this.commentsAfter(carrierData.service_metadata.comments_after);
            this.visible(true);

            this.updateFootnotes();
            serviceSelections.get().subscribe(this.updateFootnotes.bind(this));

            this.destroyChildren();
            generateServiceComponents(carrierData.service_data, this.name);
            this.elems.extend({rateLimit: {timeout: 50, method: "notifyWhenChangesStop"}});
        },

        /**
         * Update footnotes which may depend on current service selection.
         */
        updateFootnotes: function () {
            this.footnotes(footnotes.filterAvailable(
                carrierData.service_metadata.footnotes
            ));
        }
    });
});
