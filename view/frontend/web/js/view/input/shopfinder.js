define([
    'Dhl_Ui/js/view/shipping-option-input',
], function (Component) {
    'use strict';

    return Component.extend({

        defaults: {
            buttonLabel: '${ $.shippingOptionInput.label }',
            selectedShopId: null,
            selectedShopAddress: null,
            modalOpen: false
        },
    });
});
