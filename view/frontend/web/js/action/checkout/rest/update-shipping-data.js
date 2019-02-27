define([
    'Magento_Checkout/js/model/url-builder',
    'Magento_Customer/js/model/customer',
    'mage/storage',
    'Magento_Checkout/js/model/quote',
    'Magento_Checkout/js/model/shipping-service',
    'Dhl_Ui/js/model/checkout/storage',
    'Dhl_Ui/js/model/checkout/checkout-data'
], function (
    urlBuilder,
    customer,
    request,
    quote,
    shippingService,
    storage,
    checkoutData
) {
    'use strict';

    /**
     * @return {string}
     */
    var buildRequestUrl = function () {
        var url, urlParams;
        if (customer.isLoggedIn()) {
            url = '/carts/mine/dhl/get-checkout-data';
            urlParams = {};
        } else {
            url = '/guest-carts/:cartId/dhl/get-checkout-data';
            urlParams = {
                cartId: quote.getQuoteId()
            };
        }

        return urlBuilder.createUrl(url, urlParams);
    };

    /**
     * @param {string} countryId
     * @param {string} postalCode
     */
    return function (countryId, postalCode) {
        var fromCache = storage.get(countryId + postalCode);
        if (fromCache) {
            console.warn('DHL Checkout data cache disabled');
            //checkoutData.set(fromCache);
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
                console.log(response);
                storage.set(countryId + postalCode, response);
                checkoutData.set(response);
            }
        ).always(
            function () {
                shippingService.isLoading(false);
            }
        );
    }
});