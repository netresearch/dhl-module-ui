define([
    'uiComponent',
    'Dhl_Ui/js/model/shipping-option/selections',
    'Magento_Customer/js/customer-data'
], function (Component, selections, customerData) {
    'use strict';

    return Component.extend({
        defaults: {
            template: 'Dhl_Ui/checkout/address-renderer/shopfinder',
            shopfinderData: {}
        },

        initialize: function () {
            this._super();
            this.shopfinderData(selections.getShippingOptionValue('parcelshopFinder'));

            selections.get().subscribe(function () {
                this.shopfinderData(selections.getShippingOptionValue('parcelshopFinder'));
            }.bind(this));
        },

        initObservable: function () {
            this._super();
            this.observe('shopfinderData');
            return this;
        },

        getCountryName: function () {
            var countryData = customerData.get('directory-data')();

            return countryData[this.shopfinderData().countryCode]
                ? countryData[this.shopfinderData().countryCode].name
                : this.shopfinderData().countryCode;
        }
    });
});
