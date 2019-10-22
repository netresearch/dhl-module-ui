define([
    'Magento_Checkout/js/model/url-builder',
    'mage/storage',
    'Magento_Checkout/js/model/shipping-service',
], function (
    urlBuilder,
    storage,
    shippingService
) {
    'use strict';

    /**
     * @typedef {{
     *     shop_type: string,
     *     shop_number: string,
     *     shop_name: string,
     *     shop_id: string,
     *     shop_station: string,
     *     opening_hours: {
     *         day_of_week: string,
     *         opens: string,
     *         closes: string,
     *     }[],
     *     services: string[],
     *     icon: string,
     *     address: {
     *         house_no: string,
     *         postal_code: string,
     *         city: string,
     *         street: string
     *         country: string,
     *         latitude: float,
     *         longitude: float
     *     }
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

        var testData = new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve([{
                    shop_type: 'Parcel shop',
                    shop_number: '3451234',
                    shop_name: 'Parcel Shop Test',
                    shop_id: 'testid1',
                    shop_station: 'test',
                    opening_hours: [{
                        day_of_week: 'mon',
                        opens: '08:00:00',
                        closes: '16:00:00',
                    }, {
                        day_of_week: 'tue',
                        opens: '08:00:00',
                        closes: '16:00:00',
                    }],
                    services: [],
                    icon: 'test.jpg',
                    address: {
                        house_no: '11d',
                        postal_code: '041229',
                        city: 'Leipzig',
                        street: 'Nonnenstraße',
                        country: 'Germany',
                        latitude: 51.328753,
                        longitude: 12.3429326,
                    }
                },
                {
                    shop_type: 'Post office',
                    shop_number: '01234',
                    shop_name: 'test postOffice',
                    shop_id: 'testid2',
                    shop_station: 'test',
                    opening_hours: [{
                        day_of_week: 'mon',
                        opens: '08:00:00',
                        closes: '16:00:00',
                    }, {
                        day_of_week: 'tue',
                        opens: '08:00:00',
                        closes: '16:00:00',
                    }],
                    services: ['test', '123'],
                    address: {
                        house_no: '13d',
                        postal_code: '041229',
                        city: 'Leipzig',
                        street: 'Nonnenstraße',
                        country: 'Germany',
                        latitude: 51.328753,
                        longitude: 12.3439326,
                    }
                }
                ]);
            }, 1000);
        });

        return testData;

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

