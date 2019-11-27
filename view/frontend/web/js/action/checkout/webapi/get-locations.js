define([
    'Magento_Checkout/js/model/url-builder',
    'Magento_Checkout/js/model/shipping-service',
    'mage/storage'
], function (
    urlBuilder,
    shippingService,
    storage
) {
    'use strict';

    /**
     * @typedef {{
     *     shop_type: string,
     *     shop_number: string,
     *     shop_name: string,
     *     shop_id: string,
     *     opening_hours: {
     *         day_of_week: string,
     *         opens: string,
     *         closes: string,
     *     }[],
     *     icon: string,
     *     address: {
     *         postal_code: string,
     *         city: string,
     *         street: string
     *         country: string,
     *     },
     *     latitude: float,
     *     longitude: float
     * }} DhlLocation
     */

    /**
     * @typedef {{
     *     country: string,
     *     postal_code: string,
     *     city: string,
     *     street: string[],
     * }} DhlAddress
     */

    /**
     * Retrieve checkout data from Magento 2 REST endpoint and update checkoutData model.
     *
     * @param {string} carrierCode
     * @param {DhlAddress} address
     *
     * @return {Deferred} jQuery ajax result containing {DhlLocation[]}
     */
    return function (carrierCode, address) {
        var serviceUrl = urlBuilder.createUrl('/dhl/location-data/get', {}),
            payload = {carrierCode: carrierCode, address: address};

        shippingService.isLoading(true);
        return storage.post(
            serviceUrl,
            JSON.stringify(payload)
        ).always(
            function () {
                shippingService.isLoading(false);
            }
        );
    };
});

