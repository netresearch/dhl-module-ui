define([
    'underscore',
    'ko',
    'Magento_Checkout/js/model/quote',
    'Dhl_Ui/js/model/checkout/storage'
], function (_, ko, quote, storage) {
    'use strict';

    var CACHE_KEY = 'cachedShippingOptionSelections';

    /**
     * @return {string}
     */
    var getCurrentCarrier = function () {
        return quote.shippingMethod().carrier_code;
    };

    /**
     * @callback DhlShippingOptionSelectionObservable
     * @param {*[][][]} [value]
     * @return {*[][][]}
     *
     * @property DhlShippingOptionSelectionObservable
     */
    var selections = storage.get(CACHE_KEY)
        ? ko.observable(storage.get(CACHE_KEY))
        : ko.observable({});

    return {
        /**
         * @return {DhlShippingOptionSelectionObservable}
         */
        get: function () {
            return selections;
        },

        /**
         * @return {*[][][]|null}
         */
        getByCarrier: function () {
            var carrier = getCurrentCarrier();
            if (!(carrier in selections())) {
                return null;
            }
            return selections()[carrier];
        },

        /**
         * Get shipping option selection value by name and optionally by input code.
         *
         * ShippingOption values are stored separately by carrier.
         *
         * @param {string} shippingOptionCode
         * @param {string} [inputCode]
         * @return {string|string[]|null} Shipping option input value(s) or null if shipping option not found
         */
        getShippingOptionValue: function (shippingOptionCode, inputCode) {
            var carrierData = this.getByCarrier();
            if (!carrierData || !(shippingOptionCode in carrierData)) {
                return null
            }

            var selection = carrierData[shippingOptionCode];
            if (!inputCode) {
                return selection;
            } else if (inputCode in selection) {
                return selection[inputCode]
            } else {
                return null;
            }
        },

        /**
         * Collect all selected shipping option values in dot-separated format.
         *
         * @return {string[]}
         */
        getSelectionsInCompoundFormat: function () {
            var selectedCodes = [];
            _.each(this.getByCarrier(), function (values, shippingOptionCode) {
                selectedCodes.push(shippingOptionCode);
                _.each(values, function (value, inputCode) {
                    selectedCodes.push([shippingOptionCode, inputCode].join('.'))
                })
            });

            return selectedCodes;
        },

        /**
         * Add a shipping option value. Values are stored separately by carrier.
         *
         * @param {string} shippingOptionCode
         * @param {string} inputCode
         * @param {*} inputValue
         */
        addSelection: function (shippingOptionCode, inputCode, inputValue) {
            var carrier = getCurrentCarrier(),
                workingCopy = selections();
            if (workingCopy[carrier] == undefined) {
                workingCopy[carrier] = {};
            }
            if (workingCopy[carrier][shippingOptionCode] == undefined) {
                workingCopy[carrier][shippingOptionCode] = {};
            }
            workingCopy[carrier][shippingOptionCode][inputCode] = inputValue;

            storage.set(CACHE_KEY, workingCopy);
            selections(workingCopy);
        },

        /**
         * Remove a shipping option selection. Values are stored separately by carrier.
         *
         * @param {string} shippingOptionCode
         * @param {string} inputCode
         */
        removeSelection: function (shippingOptionCode, inputCode) {
            var carrier = getCurrentCarrier(),
                workingCopy = selections();
            delete workingCopy[carrier][shippingOptionCode][inputCode];
            if (_.isEmpty(workingCopy[carrier][shippingOptionCode])) {
                delete workingCopy[carrier][shippingOptionCode];
                if (_.isEmpty(workingCopy[carrier])) {
                    delete workingCopy[carrier];
                }
            }

            storage.set(CACHE_KEY, workingCopy);
            selections(workingCopy);
        }
    };
});
