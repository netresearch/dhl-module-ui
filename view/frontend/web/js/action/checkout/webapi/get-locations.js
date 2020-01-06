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
     *     display_name: string,
     *     shop_id: string,
     *     opening_hours: {
     *         day_of_week: string,
     *         time_frames: DhlTimeFrame[],
     *     }[],
     *     icon: string,
     *     services: string[],
     *     address: {
     *         company: string,
     *         postal_code: string,
     *         city: string,
     *         street: string
     *         country_code: string,
     *     },
     *     latitude: float,
     *     longitude: float,
     *     display_name: string
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
     * @typedef {{
     *     opens: string,
     *     closes: string
     * }} DhlTimeFrame
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
        var url = '/dhl/delivery-locations/:carrierCode/search',
            urlParams = {carrierCode: carrierCode},
            serviceUrl = urlBuilder.createUrl(url, urlParams),
            /** DHLGW-687: we can't name the address 'address' in the request to keep compatibility with OSC */
            payload = {searchAddress: address};

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

