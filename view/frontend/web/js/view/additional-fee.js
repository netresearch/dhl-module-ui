define([
        'Magento_Checkout/js/view/summary/abstract-total',
        'Magento_Checkout/js/model/totals',
    ], function (Component, totals) {
        "use strict";
        return Component.extend({
            /**
             * @return {number}
             */
            getValue: function () {
                var price = 0.0;

                if (totals.getSegment('dhlgw_additional_fee')) {
                    price = totals.getSegment('dhlgw_additional_fee').value;
                }

                return price;
            },

            /**
             * @return {string}
             */
            getTitle: function () {
                var title = '';

                if (totals.getSegment('dhlgw_additional_fee')) {
                    title = totals.getSegment('dhlgw_additional_fee').title;
                }

                return title;
            }
        });
    }
);
