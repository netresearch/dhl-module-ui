define([
    'underscore',
    'uiCollection',
    'Magento_Checkout/js/model/quote',
    'Dhl_Ui/js/model/checkout/checkout-data-refresh',
    'Dhl_Ui/js/action/checkout/shipping-option/generate-components',
    'Dhl_Ui/js/action/checkout/webapi/get-checkout-data',
    'Dhl_Ui/js/action/checkout/shipping-option/validation/enforce-compatibility',
    'Dhl_Ui/js/model/checkout-data',
    'Dhl_Ui/js/model/checkout/shipping-option/selections',
    'Dhl_Ui/js/model/checkout/footnotes',

], function (
    _,
    UiCollection,
    quote,
    dataRefresh,
    generateShippingOptions,
    getCheckoutData,
    enforceCompatibility,
    checkoutData,
    selections,
    footnotes
) {
    'use strict';

    /**
     * @param {DhlCarrier} carrierData
     */
    var carrierData;

    return UiCollection.extend({
        defaults: {
            template: 'Dhl_Ui/checkout/shipping-options-area',
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
            this.observe('errors image title commentsBefore commentsAfter footnotes visible');

            checkoutData.get().subscribe(this.refresh, this);
            quote.shippingMethod.subscribe(this.refresh, this);

            quote.shippingAddress.subscribe(function (shippingAddress) {
                if (dataRefresh.shouldRefresh(shippingAddress.countryId, shippingAddress.postcode)) {
                    getCheckoutData(shippingAddress.countryId, shippingAddress.postcode);
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

            carrierData = checkoutData.getByCarrier(shippingMethod.carrier_code);
            if (!carrierData) {
                this.visible(false);
                return;
            }
            this.image(carrierData.metadata.image_url);
            this.title(carrierData.metadata.title);
            this.commentsBefore(carrierData.metadata.comments_before);
            this.commentsAfter(carrierData.metadata.comments_after);
            this.visible(true);

            this.updateFootnotes();
            selections.get().subscribe(this.updateFootnotes.bind(this));

            generateShippingOptions(carrierData.service_options, this.name);
            this.elems.extend({rateLimit: {timeout: 50, method: "notifyWhenChangesStop"}});

            enforceCompatibility();
        },

        /**
         * Update footnotes which may depend on current service selection.
         *
         * @private
         */
        updateFootnotes: function () {
            this.footnotes(footnotes.filterAvailable(
                carrierData.metadata.footnotes
            ));
        }
    });
});
