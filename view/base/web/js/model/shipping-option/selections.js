define([
    'underscore',
    'ko',
], function (_, ko) {
    'use strict';


    /**
     * @callback DhlShippingOptionSelectionObservable
     * @param {*[][][]} [value]
     * @return {*[][][]}
     *
     * @property DhlShippingOptionSelectionObservable
     */
    var selections = ko.observable({});

    return {
        /**
         * @return {DhlShippingOptionSelectionObservable}
         */
        get: function () {
            return selections;
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
            var carrierData = this.get();
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
            _.each(this.get(), function (values, shippingOptionCode) {
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
            var workingCopy = selections();
            if (workingCopy[shippingOptionCode] == undefined) {
                workingCopy[shippingOptionCode] = {};
            }
            workingCopy[shippingOptionCode][inputCode] = inputValue;

            selections(workingCopy);
        },

        /**
         * Remove a shipping option selection. Values are stored separately by carrier.
         *
         * @param {string} shippingOptionCode
         * @param {string} inputCode
         */
        removeSelection: function (shippingOptionCode, inputCode) {
            var workingCopy = selections();
            delete workingCopy[shippingOptionCode][inputCode];
            if (_.isEmpty(workingCopy[shippingOptionCode])) {
                delete workingCopy[shippingOptionCode];
            }

            selections(workingCopy);
        }
    };
});
