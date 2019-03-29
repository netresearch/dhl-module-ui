/**
 * See LICENSE.md for license details.
 */
define([
    'Magento_Ui/js/grid/columns/column'
], function (Element) {
    'use strict';

    return Element.extend({
        /**
         * Obtain icon url for orders with label status "Pending".
         *
         * @returns {String}
         */
        getPendingIconUrl: function () {
            return require.toUrl('Dhl_Ui/images/icon_incomplete.png');
        },

        /**
         * Obtain icon url for orders with label status "Processed".
         *
         * @returns {String}
         */
        getProcessedIconUrl: function () {
            return require.toUrl('Dhl_Ui/images/icon_complete.png');
        },

        /**
         * Obtain icon url for orders with label status "Failed".
         *
         * @returns {String}
         */
        getFailedIconUrl: function () {
            return require.toUrl('Dhl_Ui/images/icon_failed.png');
        }
    });
});
