define([
    'underscore',
    'uiLayout',
], function (_, layout) {
    'use strict';

    /**
     * @var {DhlShippingOption[]} shippingOptions
     * @var {string} parentName
     */
    return function (shippingOptions, parentName) {
        var shippingOptionsLayout = _.map(shippingOptions, function (shippingOption) {
            return {
                parent: parentName,
                component: 'Dhl_Ui/js/view/checkout/shipping-option',
                shippingOption: shippingOption,
                shippingOptionCode: shippingOption.code,
            };
        }, this);

        layout(shippingOptionsLayout);
    }
});
