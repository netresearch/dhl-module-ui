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
            },
            'Magento_Customer/js/model/customer/address': {
                'Dhl_Ui/js/mixin/checkout/ship-to-address': true
            },
            'Magento_Checkout/js/model/new-customer-address': {
                'Dhl_Ui/js/mixin/checkout/ship-to-address': true
            }
        }
    },
    paths: {
        leaflet: 'Dhl_Ui/lib/leaflet/leaflet'
    }
};
