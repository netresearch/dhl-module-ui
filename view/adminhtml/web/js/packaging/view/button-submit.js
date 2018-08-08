define([
    'Magento_Ui/js/form/components/button'
], function (Button) {
    'use strict';

    return Button.extend({
        /**
         * Executed when the button is clicked.
         */
        action: function () {
            this.submitShipmentRequest();
        },

        /**
         * @private
         */
        submitShipmentRequest: function () {

        }
    })
});
