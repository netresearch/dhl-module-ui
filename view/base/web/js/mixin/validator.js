define([
    'underscore',
    'mage/translate',
    'Magento_Ui/js/lib/validation/utils'
], function (_, $t, utils) {
    'use strict';

    /**
     * This mixin adds custom input validation routines to the core validation flow.
     */
    return function (validator) {
        /**
         * @type {string[]}
         */
        var packingStationWords = [
            'paketbox', 'packstation', 'paketshop', 'postfach', 'postfiliale', 'filiale', 'paketkasten',
            'dhlpaketstation', 'parcelshop', 'pakcstation', 'paackstation', 'pakstation', 'backstation',
            'bakstation', 'wunschfiliale', 'deutsche post'
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
                });
        };

        /**
         * Validator to disallow Packstation- or Postfiliale-related words as input value.
         */
        validator.addRule(
            'dhl_filter_packing_station',
            function (value) {
                return !isOnBlacklist(value, packingStationWords);
            },
            $t('You must not refer to a packing station, postal office, or similar.')
        );

        /**
         * Validator to disallow special chars in the input value.
         */
        validator.addRule(
            'dhl_filter_special_chars',
            function (value) {
                return !isOnBlacklist(value, specialChars);
            },
            $t('Your input must not include one of the following: ') + specialChars.join(' ')
        );

        /**
         * Validator to only allow quantities in a range
         * that also prints out the allowed qty range in the error message.
         * Based on 'validate-number-range' from Magento core.
         */
        validator.addRule(
            'dhl_validate_qty_range',

            /**
             * @param {string} value
             * @param {int[]} params
             * @return {boolean}
             */
            function (value, params) {
                var numValue;

                if (params.length < 2) {
                    return false;
                }
                if (utils.isEmptyNoTrim(value)) {
                    return true;
                }

                numValue = utils.parseNumber(value);

                if (isNaN(numValue)) {
                    return false;
                }

                return utils.isBetween(numValue, params[0], params[1]);
            },
            $t('Item quantity must be between {0} and {1}.')
        );

        return validator;
    };
});
