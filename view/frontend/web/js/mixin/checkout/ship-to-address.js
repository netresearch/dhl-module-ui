define([
    'underscore',
    'mage/utils/wrapper',
    'Dhl_Ui/js/model/shipping-option/selections',
    'Magento_Checkout/js/model/quote'
], function (_, wrapper, selections, quote) {
    'use strict';

    /**
     * For Magento 2.3 we need to fake an address update to trigger re-rendering the
     * shipping address component in the sidebar on the payment step when selections change.
     * From Magento 2.4 and up, the shipping address is a pure computed object and will reconsider
     * changes to results of the getType function (see below) automatically.
     */
    selections.get().subscribe(function () {
        if (quote.shippingAddress.valueHasMutated) {
            quote.shippingAddress.valueHasMutated();
        }
    });

    return function (target) {
        return wrapper.wrap(target, function (constructor, addressData) {
            var address = constructor(addressData);
            var mixin = {
                // if pickup location was selected, load a custom template by setting a custom address type
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

