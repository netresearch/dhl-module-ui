var config = {
    config: {
        mixins: {
            'Magento_Checkout/js/action/set-shipping-information': {
                'Dhl_Ui/js/mixin/checkout/set-shipping-information': true
            },
            'Magento_Checkout/js/view/shipping-information': {
                'Dhl_Ui/js/mixin/checkout/shipping-information': true
            },
            'Magento_Checkout/js/action/place-order': {
                'Dhl_Ui/js/mixin/checkout/place-order': true
            }
        }
    },
    paths: {
        leaflet: 'Dhl_Ui/lib/leaflet/leaflet'
    }
};
