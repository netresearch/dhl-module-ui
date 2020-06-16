define([
    'underscore',
    'jquery',
    'mage/storage',
    'Magento_Checkout/js/model/url-builder',
    'Magento_Customer/js/model/customer',
    'Magento_Checkout/js/model/quote',
    'Dhl_Ui/js/model/shipping-option/selections',
    'Dhl_Ui/js/model/current-carrier',
], function (_, $, storage, urlBuilder, customer, quote, selectionsModel, currentCarrier) {
    'use strict';

    /**
     * Save current DHL service selection against Magento REST API endpoint.
     *
     * @return {Deferred}
     */
    return function () {
        var url,
            urlParams,
            serviceUrl,
            payload,
            selections,
            carrier = currentCarrier.get();

        if (quote.isVirtual()) {
            return $.Deferred().resolve();
        }

        if (!carrier) {
            return $.Deferred.reject('No shipping option selected');
        }

        selections = selectionsModel.getByCarrier(carrier);

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

        return storage.post(
            serviceUrl,
            JSON.stringify(payload)
        ).fail(
            function () {
                console.warn('Shipping option selections could not be saved');
            }
        );
    };
});
