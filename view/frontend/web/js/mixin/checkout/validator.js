define([
    'underscore',
    'Magento_Checkout/js/model/quote',
    'mage/translate'
], function (_, quote, $t) {
    'use strict';

    /**
     * This mixin adds custom input validation routines to the core validation flow.
     */
    return function (validator) {
        /**
         * @type {string[]}
         */
        var packingStationWords = [
            'paketbox', 'packstation', 'paketshop', 'postfach', 'postfiliale', 'filiale', 'paketkasten', 'dhlpaketstation',
            'parcelshop', 'pakcstation', 'paackstation', 'pakstation', 'backstation', 'bakstation', 'wunschfiliale',
            'deutsche post'
        ];

        /**
         * @type {string[]}
         */
        var specialChars = ['<', '>', '\\n', '\\r', '\\', '\'', '"', ';', '+'];

        /**
         * @param {string} value
         * @param {string[]} blacklist
         * @return {boolean}
         */
        var isOnBlacklist = function (value, blacklist) {
                return undefined !== _.find(blacklist, function (blacklistItem) {
                    return value.toLowerCase().indexOf(blacklistItem) !== -1;
                })
        };

        /**
         * Validator to disallow Packstation- or Postfiliale-related words as input value.
         */
        validator.addRule(
            'dhl_filter_packing_station',
            function (value, params) {
                return !isOnBlacklist(value, packingStationWords);
            },
            $t('You must not refer to a packing station, postal office, or similar.')
        );

        /**
         * Validator to disallow special chars in the input value.
         */
        validator.addRule(
            'dhl_filter_special_chars',
            function (value, params) {
                return !isOnBlacklist(value, specialChars);
            },
            $t('Your input must not include one of the following: ') + specialChars.join(' ')
        );

        /**
         * Validator to make sure the input is not selected/filled while the
         * Packing Station feature is used (a Packstation or Postfiliale
         * is set in the street[0] field).
         */
        validator.addRule(
            'dhl_not_allowed_with_parcelshop',
            function (value, params) {
                if (value) {
                    return !isOnBlacklist(quote.shippingAddress().street[0], packingStationWords)
                }
                return true;
            },
            $t('This shipping option is not available at a DHL packing station of post office.')
        );

        return validator;
    };
});
