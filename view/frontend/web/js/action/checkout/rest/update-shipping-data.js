define([
    'Magento_Checkout/js/model/url-builder',
    'mage/storage',
    'Magento_Checkout/js/model/quote',
    'Magento_Checkout/js/model/shipping-service',
    'Dhl_Ui/js/model/checkout/storage',
    'Dhl_Ui/js/model/shipping-settings'
], function (
    urlBuilder,
    request,
    quote,
    shippingService,
    storage,
    shippingSettings
) {
    'use strict';

    /**
     * @return {string}
     */
    var buildRequestUrl = function () {
        var url = '/dhl/get-checkout-data',
            urlParams = {};

        return urlBuilder.createUrl(url, urlParams);
    };

    /**
     * @param {string} countryId
     * @param {string} postalCode
     */
    return function (countryId, postalCode) {
        var fromCache = storage.get(countryId + postalCode);
        if (fromCache) {
            console.warn('DHL checkout shipping data cache disabled');
            //shippingSettings.set(fromCache);
            //return;
        }

        var serviceUrl = buildRequestUrl(),
            payload = {countryId: countryId, postalCode: postalCode};

        shippingService.isLoading(true);
        request.post(
            serviceUrl,
            JSON.stringify(payload)
        ).success(
            function (response) {
                storage.set(countryId + postalCode, response);
                shippingSettings.set(response);
            }
        ).always(
            function () {
                shippingService.isLoading(false);
            }
        );
    }
});
