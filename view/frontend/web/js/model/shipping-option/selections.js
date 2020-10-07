define([
    'underscore',
    'ko',
    'Dhl_Ui/js/model/checkout/storage',
    'Dhl_Ui/js/model/current-carrier'
], function (_, ko, storage, currentCarrier) {
    'use strict';

    var CACHE_KEY = 'cachedShippingOptionSelections';

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

    /**
     * Debounce selections to not overwhelm subscribers
     */
    selections.extend({rateLimit: {timeout: 500, method: 'notifyWhenChangesStop'}});

    return {

        /**
         * Reset all selections and storage in local cache
         */
        reset: function () {
            selections({});
            storage.set(CACHE_KEY, {});
        },

        /**
         * @return {DhlShippingOptionSelectionObservable}
         */
        get: function () {
            return selections;
        },

        /**
         * @return {*[][][]|null}
         */
        getByCarrier: function (carrierCode) {
            if (!(carrierCode in selections())) {
                return null;
            }
            return selections()[carrierCode];
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
            var carrier = currentCarrier.get(),
                carrierData,
                selection;

            if (!carrier) {
                return null;
            }

            carrierData = this.getByCarrier(carrier);

            if (!carrierData || !(shippingOptionCode in carrierData)) {
                return null;
            }

            selection = carrierData[shippingOptionCode];
            if (!inputCode) {
                return selection;
            } else if (inputCode in selection) {
                return selection[inputCode];
            }

            return null;
        },

        /**
         * Collect the stored selection values in a flat format.
         *
         * @return {{code: string, value: string}[]}
         */
        getSelectionValuesInCompoundFormat: function () {
            var selectionObjects = [],
                carrier = currentCarrier.get();

            if (!carrier) {
                return selectionObjects;
            }

            _.each(this.getByCarrier(carrier), function (values, shippingOptionCode) {
                _.each(values, function (inputValue, inputCode) {
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
         * Collect all selected shipping option values in dot-separated format.
         *
         * @return {string[]}
         */
        getSelectionsInCompoundFormat: function () {
            var selectedCodes = [],
                carrier = currentCarrier.get();

            if (!carrier) {
                return selectedCodes;
            }

            _.each(this.getByCarrier(carrier), function (values, shippingOptionCode) {
                selectedCodes.push(shippingOptionCode);
                _.each(values, function (value, inputCode) {
                    selectedCodes.push([shippingOptionCode, inputCode].join('.'));
                });
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
            var carrier = currentCarrier.get(),
                workingCopy = selections();

            if (!carrier) {
                return;
            }

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
            var carrier = currentCarrier.get(),
                workingCopy = selections();

            if (!carrier) {
                return;
            }

            if (workingCopy[carrier]) {
                if (workingCopy[carrier][shippingOptionCode]) {
                    if (workingCopy[carrier][shippingOptionCode].hasOwnProperty(inputCode)) {
                        delete workingCopy[carrier][shippingOptionCode][inputCode];
                    }
                    if (_.isEmpty(workingCopy[carrier][shippingOptionCode])) {
                        delete workingCopy[carrier][shippingOptionCode];
                    }
                }
                if (_.isEmpty(workingCopy[carrier])) {
                    delete workingCopy[carrier];
                }
            }

            storage.set(CACHE_KEY, workingCopy);
            selections(workingCopy);
        }
    };
});
