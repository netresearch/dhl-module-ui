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
    var selections = [{items: {}}];

    var currentSelection = ko.observable({items: {}});



    return {
        /**
         * @return {DhlShippingOptionSelectionObservable}
         */
        get: function () {
            return currentSelection;
        },

        /**
         * Get shipping option selection value by name and optionally by input code.
         *
         * ShippingOption values are stored separately by carrier.
         *
         * @param {string} shippingOptionCode
         * @param {string} [inputCode]
         * @param {integer|false} itemId
         * @return {string|string[]|null} Shipping option input value(s) or null if shipping option not found
         */
        getShippingOptionValue: function (shippingOptionCode, inputCode, itemId) {
            var packageData = currentSelection();
            if (!packageData || !(shippingOptionCode in packageData)) {
                return null
            }
            if (itemId === false) {
                var selection = packageData[shippingOptionCode];
            } else {
                var selection = packageData['items'][itemId][shippingOptionCode];
            }
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
            _.each(currentSelection(), function (values, shippingOptionCode) {
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
         * @param {integer|false} itemId
         * @param {*} inputValue
         */
        addSelection: function (shippingOptionCode, inputCode, itemId, inputValue) {
            var workingCopy = currentSelection();
            if (itemId === false) {
                if (workingCopy[shippingOptionCode] === undefined) {
                    workingCopy[shippingOptionCode] = {};
                }
                workingCopy[shippingOptionCode][inputCode] = inputValue;
            } else {
                if (workingCopy['items'][itemId] === undefined) {
                    workingCopy['items'][itemId] = {};
                }
                if (workingCopy['items'][itemId][shippingOptionCode] === undefined) {
                    workingCopy['items'][itemId][shippingOptionCode] = {};
                }
                workingCopy['items'][itemId][shippingOptionCode][inputCode] = inputValue;
            }

            this.set(workingCopy);
        },

        /**
         * Remove a shipping option selection. Values are stored separately by carrier.
         *
         * @param {string} shippingOptionCode
         * @param {integer|false} itemId
         * @param {string} inputCode
         */
        removeSelection: function (shippingOptionCode, inputCode, itemId) {
            var workingCopy = currentSelection();
            if (itemId === false) {
                delete workingCopy[shippingOptionCode][inputCode];
                if (_.isEmpty(workingCopy[shippingOptionCode])) {
                    delete workingCopy[shippingOptionCode];
                }
            } else {
                delete workingCopy['items'][itemId][shippingOptionCode][inputCode];
                if (_.isEmpty(workingCopy['items'][itemId][shippingOptionCode])) {
                    delete workingCopy['items'][itemId][shippingOptionCode];
                }
            }

            this.set(workingCopy);
        },

        set: function (newSelections) {
            currentSelection(newSelections);
        },

        /**
         * @return {[DhlShippingOptionSelectionObservable]}
         */
        getAll: function () {
            return selections;
        },

        setAll:function (newSelections) {
            selections = newSelections;
        }
    };
});