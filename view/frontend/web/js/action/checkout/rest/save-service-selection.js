define([
    'underscore',
    'Magento_Checkout/js/model/url-builder',
    'Magento_Customer/js/model/customer',
    'mage/storage',
    'Magento_Checkout/js/model/quote',
    'Dhl_Ui/js/model/checkout/service/service-selections'
], function (_, urlBuilder, customer, storage, quote, serviceSelection) {
    'use strict';

    /**
     * Save current DHL service selection against Magento REST API endpoint.
     */
    return function () {
        var url,
            urlParams,
            serviceUrl,
            payload,
            carrier = quote.shippingMethod().carrier_code,
            serviceSelectionData = serviceSelection.get()();

        if (customer.isLoggedIn()) {
            url = '/carts/mine/dhl/services/set-selection';
            urlParams = {};
        } else {
            url = '/guest-carts/:cartId/dhl/services/set-selection';
            urlParams = {
                cartId: quote.getQuoteId()
            };
        }
        payload = {
            serviceSelection: [],
        };
        /** Only submit service selections for the current carrier */
        if (serviceSelectionData[carrier]) {
            _.each(serviceSelectionData[carrier], function (value, key) {
                payload.serviceSelection.push(
                    {
                        attribute_code: key,
                        value: value
                    }
                );
            });
        }

        serviceUrl = urlBuilder.createUrl(url, urlParams);
        return storage.post(
            serviceUrl,
            JSON.stringify(payload)
        );
    };
});
