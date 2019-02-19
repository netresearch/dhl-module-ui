var config = {
    config: {
        mixins: {
            'Magento_Checkout/js/action/set-shipping-information': {
                'Dhl_Ui/js/mixin/checkout/set-shipping-information': true
            },
            'Magento_Ui/js/lib/validation/validator': {
                'Dhl_Ui/js/mixin/checkout/validator': true
            },
            'Magento_Checkout/js/action/place-order': {
                'Dhl_Ui/js/mixin/checkout/place-order': true
            }
        }
    }
};
