define([
    'underscore',
    'ko',
], function (_, ko) {
    'use strict';

    /**
     * @property array
     */
    var selections = [];

    /**
     * @callback DhlShippingOptionSelectionObservable
     * @param {*[][][]} [value]
     * @return {*[][][]}
     *
     * @property DhlShippingOptionSelectionObservable
     */
    var currentSelection = ko.observable({}).extend({rateLimit: {timeout: 50, method: 'notifyWhenChangesStop'}});

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
         * @param {string} section
         * @param {string} shippingOptionCode
         * @param {string} [inputCode]
         * @param {integer|false} itemId
         * @return {string|string[]|null} Shipping option input value(s) or null if shipping option not found
         */
        getShippingOptionValue: function (section, shippingOptionCode, inputCode, itemId) {
            var packageData = currentSelection(),
                selection;

            if (!packageData) {
                return null;
            }
            if (section !== '' && !(section in packageData)) {
                return null;
            }

            selection = packageData[section];

            if (itemId === false) {
                if (!(shippingOptionCode in selection)) {
                    return null;
                }
                selection = selection[shippingOptionCode];
            } else {
                if (!(itemId in selection) || !(shippingOptionCode in selection[itemId])) {
                    return null;
                }
                selection = selection[itemId][shippingOptionCode];
            }
            if (!inputCode) {
                return selection;
            } else if (inputCode in selection) {
                return selection[inputCode];
            }

            return null;
        },

        /**
         * Collect all selected shipping option codes (without values) in dot-separated format.
         *
         * @return {string[]}
         */
        getSelectionsInCompoundFormat: function () {
            var selectedCodes = [];

            _.each(currentSelection(), function (values, shippingOptionCode) {
                selectedCodes.push(shippingOptionCode);
                _.each(values, function (value, inputCode) {
                    selectedCodes.push([shippingOptionCode, inputCode].join('.'));
                });
            });

            return selectedCodes;
        },


        /**
         * Collect the stored selection values in a flat format.
         *
         * @return {{code: string, value: string}[]}
         */
        getSelectionValuesInCompoundFormat: function () {
            var selectionObjects = [];
            _.each(this.get()().package, function (shippingOption, shippingOptionCode) {
                _.each(shippingOption, function (inputValue, inputCode) {
                    if (inputValue) {
                        selectionObjects.push({
                            code: [shippingOptionCode, inputCode].join('.'),
                            value: inputValue === true ? '1' : String(inputValue),
                        });
                    }
                });
            });

            return selectionObjects;
        },

        /**
         * Add a shipping option value. Values are stored separately by carrier.
         *
         * @param {string} section
         * @param {string} shippingOptionCode
         * @param {string} inputCode
         * @param {integer|false} itemId
         * @param {*} inputValue
         */
        addSelection: function (section, shippingOptionCode, inputCode, itemId, inputValue) {
            var workingCopy = currentSelection(),
                selection;

            if (section === '') {
                selection = workingCopy;
            } else {
                if (workingCopy[section] === undefined) {
                    workingCopy[section] = {};
                }
                selection = workingCopy[section];
            }
            if (itemId === false) {
                if (selection[shippingOptionCode] === undefined) {
                    selection[shippingOptionCode] = {};
                }
                selection[shippingOptionCode][inputCode] = inputValue;
            } else {
                if (selection[itemId] === undefined) {
                    selection[itemId] = {};
                }
                if (selection[itemId][shippingOptionCode] === undefined) {
                    selection[itemId][shippingOptionCode] = {};
                }
                selection[itemId][shippingOptionCode][inputCode] = inputValue;
            }
            if (section !== '') {
                workingCopy[section] = selection;
            }
            this.set(workingCopy);
        },

        /**
         * Remove a shipping option selection. Values are stored separately by carrier.
         *
         * @param {string} section
         * @param {string} shippingOptionCode
         * @param {integer|false} itemId
         * @param {string} inputCode
         */
        removeSelection: function (section, shippingOptionCode, inputCode, itemId) {
            var workingCopy = currentSelection(),
                selection;

            if (section === '') {
                selection = workingCopy;
            } else {
                if (workingCopy[section] === undefined) {
                    workingCopy[section] = {};
                }
                selection = workingCopy[section];
            }
            if (itemId === false) {
                delete selection[shippingOptionCode][inputCode];
                if (_.isEmpty(selection[shippingOptionCode])) {
                    delete selection[shippingOptionCode];
                }
            } else {
                delete selection[itemId][shippingOptionCode][inputCode];
                if (_.isEmpty(selection[itemId][shippingOptionCode])) {
                    delete selection[itemId][shippingOptionCode];
                }
            }
            if (section !== '') {
                workingCopy[section] = selection;
            }

            this.set(workingCopy);
        },

        set: function (newSelections) {
            if (newSelections.packageId !== currentSelection().packageId) {
                /**
                 * Transfer current working state into selection list to avoid data loss on package switch
                 */
                selections = this.getAll();
            }
            currentSelection(newSelections);
        },

        /**
         * @return {[DhlShippingOptionSelectionObservable]}
         */
        getAll: function () {
            var index = selections.findIndex(function (selection) {
                return selection.packageId === (currentSelection().packageId || false);
            });

            if (index >= 0) {
                /**
                 * Update selection list with latest status of the current selection so everything is up to date
                 * Check if the current selection does not belong to a deleted package
                 */
                selections.splice(index, 1, currentSelection());
            }
            return selections;
        },

        setAll: function (newSelections) {
            selections = newSelections;
        },

        reset: function () {
            selections = [];
            currentSelection = ko.observable({});
        }
    };
});
