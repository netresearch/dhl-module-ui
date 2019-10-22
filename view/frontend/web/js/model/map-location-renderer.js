/**
 * See LICENSE.md for license details.
 */
define([
    'mage/utils/template',
    'text!Dhl_Ui/template/checkout/location/popup.html',
], function (template, popupTmpl) {
    'use strict';

    return {
        /**
         * @param {DhlLocation} location
         * @return {string}
         */
        render: function (location) {
            var html;
            var config = {
                location: location
            };

            html = template.template(popupTmpl, config);

            return html;
        }
    };
});
