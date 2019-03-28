define([
    'underscore',
    'uiCollection',
    'Magento_Checkout/js/model/quote',
    'Dhl_Ui/js/model/checkout/shipping-settings-refresh',
    'Dhl_Ui/js/action/checkout/generate-service-components',
    'Dhl_Ui/js/action/checkout/rest/update-shipping-data',
    'Dhl_Ui/js/action/checkout/validation/enforce-service-compatibility',
    'Dhl_Ui/js/model/shipping-settings',
    'Dhl_Ui/js/model/checkout/service/service-selections',
    'Dhl_Ui/js/model/checkout/footnotes',

], function (
    _,
    UiCollection,
    quote,
    settingsRefresh,
    generateServiceComponents,
    updateShippingData,
    enforceServiceCompatibility,
    shippingSettings,
    serviceSelections,
    footnotes
) {
    'use strict';

    /**
     * @param {DhlCarrier} carrierData
     */
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

            shippingSettings.get().subscribe(this.refresh, this);
            quote.shippingMethod.subscribe(this.refresh, this);

            quote.shippingAddress.subscribe(function (shippingAddress) {
                if (settingsRefresh.shouldRefresh(shippingAddress.countryId, shippingAddress.postcode)) {
                    updateShippingData(shippingAddress.countryId, shippingAddress.postcode);
                }
            });

            return this;
        },

        /**
         * @private
         */
        refresh: function () {
            var shippingMethod = quote.shippingMethod();
            if (!shippingMethod) {
                return;
            }

            carrierData = shippingSettings.getByCarrier(shippingMethod.carrier_code);
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

            enforceServiceCompatibility();
        },

        /**
         * Update footnotes which may depend on current service selection.
         *
         * @private
         */
        updateFootnotes: function () {
            this.footnotes(footnotes.filterAvailable(
                carrierData.service_metadata.footnotes
            ));
        }
    });
});
