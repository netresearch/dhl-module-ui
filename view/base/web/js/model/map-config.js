define([
], function () {
    'use strict';

    return {
        /**
         * Get location finder config map tile api token
         * @return {string}
         */
        getToken: function () {
            return window.checkoutConfig.locationFinder.maptileApiToken;
        },

        /**
         * Get location finder config map tile url
         * @return {string}
         */
        getUrl: function () {
            return window.checkoutConfig.locationFinder.maptileUrl;
        },

        /**
         * Get location finder config map attribution
         * @return {string}
         */
        getAttribution: function () {
            return window.checkoutConfig.locationFinder.mapAttribution;
        }
    };
});
