define([
    'Magento_Checkout/js/model/url-builder',
    'mage/storage',
    'Magento_Checkout/js/model/quote',
    'Magento_Checkout/js/model/shipping-service',
    'Magento_Checkout/js/model/full-screen-loader',
    'Dhl_Ui/js/model/checkout/storage',
    'Dhl_Ui/js/model/shipping-settings'
], function (
    urlBuilder,
    request,
    quote,
    shippingService,
    fullScreenLoader,
    storage,
    checkoutData
) {
    'use strict';

    /**
     * Retrieve checkout data from Magento 2 REST endpoint and update checkoutData model.
     *
     * @param {string} countryId
     * @param {string} postalCode
     */
    return function (countryId, postalCode) {
        var fromCache = storage.get(countryId + postalCode),
            serviceUrl = urlBuilder.createUrl('/dhl/checkout-data/get', {}),
            payload = {countryId: countryId, postalCode: postalCode};

        if (fromCache) {
            console.warn('DHL checkout data cache disabled');
            //checkoutData.set(fromCache);
            //return;
        }

        fullScreenLoader.startLoader();
        shippingService.isLoading(true);
        request.post(
            serviceUrl,
            JSON.stringify(payload)
        ).success(
            function (response) {
                storage.set(countryId + postalCode, response);
                checkoutData.set(response);
            }
        ).always(
            function () {
                fullScreenLoader.stopLoader();
                shippingService.isLoading(false);
            }
        );
    };
});
