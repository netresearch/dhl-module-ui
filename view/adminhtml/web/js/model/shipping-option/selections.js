define([
    'underscore',
    'ko',
    'Dhl_Ui/js/packaging/model/package-state'
], function (_, ko, packageState) {
    'use strict';


    /**
     * @callback DhlShippingOptionSelectionObservable
     * @param {*[][][]} [value]
     * @return {*[][][]}
     *
     * @property DhlShippingOptionSelectionObservable
     */
    var selections = [ko.observable({})];

    var currentSelection = ko.observable({});

    packageState.currentPackage.subscribe(function (previousValue) {
        selections[previousValue] = currentSelection;
    }, this, "beforeChange");
    packageState.currentPackage.subscribe(function (newValue) {
        if (!selections[newValue]) {
            selections[newValue] = ko.observable({});
        }
        currentSelection = selections[newValue];
    });

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
         * @return {string|string[]|null} Shipping option input value(s) or null if shipping option not found
         */
        getShippingOptionValue: function (shippingOptionCode, inputCode) {
            var packageData = currentSelection();
            if (!packageData || !(shippingOptionCode in packageData)) {
                return null
            }

            var selection = packageData[shippingOptionCode];
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
         * @param {*} inputValue
         */
        addSelection: function (shippingOptionCode, inputCode, inputValue) {
            var workingCopy = currentSelection();
            if (workingCopy[shippingOptionCode] === undefined) {
                workingCopy[shippingOptionCode] = {};
            }
            workingCopy[shippingOptionCode][inputCode] = inputValue;

            this.set(workingCopy);
        },

        /**
         * Remove a shipping option selection. Values are stored separately by carrier.
         *
         * @param {string} shippingOptionCode
         * @param {string} inputCode
         */
        removeSelection: function (shippingOptionCode, inputCode) {
            var workingCopy = currentSelection();
            delete workingCopy[shippingOptionCode][inputCode];
            if (_.isEmpty(workingCopy[shippingOptionCode])) {
                delete workingCopy[shippingOptionCode];
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
            selections[packageState.currentPackage()] = currentSelection;
            return selections;
        }
    };
});
