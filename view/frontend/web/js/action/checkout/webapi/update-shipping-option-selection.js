define([
    'underscore',
    'mage/storage',
    'Magento_Checkout/js/model/url-builder',
    'Magento_Customer/js/model/customer',
    'Magento_Checkout/js/model/quote',
    'Magento_Checkout/js/model/shipping-service',
    'Magento_Checkout/js/model/full-screen-loader',
    'Dhl_Ui/js/model/shipping-option/selections',
    'Dhl_Ui/js/model/current-carrier',
], function (_, storage, urlBuilder, customer, quote, shippingService, fullScreenLoader, selectionsModel, currentCarrier) {
    'use strict';

    /**
     * Save current DHL service selection against Magento REST API endpoint.
     */
    return function () {
        var url,
            urlParams,
            serviceUrl,
            payload,
            selections = selectionsModel.getByCarrier(currentCarrier.get());

        if (customer.isLoggedIn()) {
            url = '/carts/mine/dhl/shipping-option/selection/update';
            urlParams = {};
        } else {
            url = '/guest-carts/:cartId/dhl/shipping-option/selection/update';
            urlParams = {
                cartId: quote.getQuoteId()
            };
        }
        payload = {
            shippingOptionSelections: [],
        };

        /** Only submit service selections for the current carrier */
        if (selections) {
            _.each(selections, function (selection, serviceCode) {
                _.each(selection, function (value, inputCode) {
                    payload.shippingOptionSelections.push(
                        {
                            shippingOptionCode: serviceCode,
                            inputCode: inputCode,
                            inputValue: value,
                        }
                    );
                });
            });
        }


        serviceUrl = urlBuilder.createUrl(url, urlParams);

        fullScreenLoader.startLoader();
        shippingService.isLoading(true);
        return storage.post(
            serviceUrl,
            JSON.stringify(payload)
        ).fail(
            function () {
                console.warn('Shipping option selections could not be saved');
            }
        ).always(
            function () {
                fullScreenLoader.stopLoader();
                shippingService.isLoading(false);
            }
        );
    };
});
