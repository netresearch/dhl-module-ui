define([
    'underscore',
    'uiLayout',
], function (_, layout) {
    'use strict';

    /**
     * @var {DhlShippingOption[]} shippingOptions
     * @var {string} parentName
     * @var {integer|false} [itemId]
     */
    return function (shippingOptions, parentName, itemId) {
        var shippingOptionsLayout = _.map(shippingOptions, function (shippingOption) {
            return {
                parent: parentName,
                component: 'Dhl_Ui/js/view/shipping-option',
                shippingOption: shippingOption,
                shippingOptionCode: shippingOption.code,
                name: shippingOption.code,
                itemId: itemId ? itemId : false,
            };
        }, this);

        layout(shippingOptionsLayout);
    };
});
