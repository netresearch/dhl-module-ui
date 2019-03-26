define([
], function () {
    'use strict';

    var currentCountryId = '',
        currentPostalCode = '';

    return {
        /**
         * Determine if the shipping settings should be refreshed based on the current quote.
         *
         * @param {string} countryId
         * @param {string} postalCode
         * @return {boolean}
         */
        shouldRefresh: function (countryId, postalCode) {
            if (!countryId || !postalCode) {
                return false;
            }

            if ((countryId !== currentCountryId)
                || (postalCode !== currentPostalCode)
            ) {
                currentCountryId = countryId;
                currentPostalCode = postalCode;

                return true;
            }

            return false;
        }
    }
});
