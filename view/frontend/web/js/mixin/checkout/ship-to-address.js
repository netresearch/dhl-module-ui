define([
    'underscore',
    'mage/utils/wrapper',
    'Dhl_Ui/js/model/shipping-option/selections',
    'Magento_Checkout/js/model/quote'
], function (_, wrapper, selections, quote) {
    'use strict';

    /**
     * Needed to trigger createRenderComponent from list.js
     * and re-render the shipping address when selections change.
     */
    selections.get().subscribe(function () {
        quote.shippingAddress.valueHasMutated();
    });

    return function (target) {
        return wrapper.wrap(target, function (constructor, addressData) {
            var address = constructor(addressData);
            var mixin = {
                getType: wrapper.wrap(address.getType, function (originalFunction) {
                    if (selections.getShippingOptionValue('parcelshopFinder')) {
                        return 'pickup-location';
                    }
                    return originalFunction();
                })
            };

            return _.extend(address, mixin);
        });
    };
});

