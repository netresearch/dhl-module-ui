define([
    'Magento_Tax/js/view/checkout/cart/totals/shipping',
    'Magento_Checkout/js/model/totals',
], function (Component, totals) {
    "use strict";
    return Component.extend({
        defaults: {
            template: 'Dhl_Ui/checkout/summary/shipping'
        },

        /**
         * @return {String}
         */
        getIncludingValue: function () {
            var price;

            if (!this.isCalculated()) {
                return this.notCalculatedMessage;
            }
            price = totals.getSegment('dhlgw_additional_fee').extension_attributes['dhlgw_fee_incl_tax'];

            return this.getFormattedPrice(price);
        },

        /**
         * @return {String}
         */
        getExcludingValue: function () {
            var price;

            if (!this.isCalculated()) {
                return this.notCalculatedMessage;
            }
            price = totals.getSegment('dhlgw_additional_fee').extension_attributes['dhlgw_fee'];

            return this.getFormattedPrice(price);
        },

        /**
         * @return {Number}
         */
        getValue: function () {
            var segment = totals.getSegment('dhlgw_additional_fee');

            if (segment) {
                return segment.value;
            }

            return 0;
        },

        /**
         * @return {string}
         */
        getTitle: function () {
            var segment = totals.getSegment('dhlgw_additional_fee');

            if (segment) {
                return segment.title;
            }

            return '';
        }
    });
});
