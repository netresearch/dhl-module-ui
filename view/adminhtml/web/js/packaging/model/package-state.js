define([
    'underscore',
    'ko',
    'Dhl_Ui/js/model/shipping-option/selections',
    'Dhl_Ui/js/packaging/action/get-unpacked-items',
    'uiRegistry'
], function (_, ko, selections, getUnpackedItems, registry) {
    'use strict';

    var packages = ko.observableArray([]),
        currentPackage = ko.observable(0),
        allItemsPackaged = ko.observable(false);

    /**
     * @param {Object} object
     * @return {Object}
     */
    var deepClone = function (object) {
        return JSON.parse(JSON.stringify(object));
    };

    var getInputValueFromDom = function (inputCode, itemId) {
        var inputElement = registry.get({inputCode: inputCode, itemId: itemId});

        if (inputElement) {
            return inputElement.value();
        }
        return "";
    };

    /**
     * Resets the whole package state, dismissing all existing data.
     */
    var reset = function () {
        packages([]);
        currentPackage(0);
        allItemsPackaged(false);
    };

    /**
     * Goes through all selection data and extracts the unpacked items
     *
     * @param readFromDom {boolean|undefined}  - if true the selections will be read from the actual input components
     * @returns {{{id: int, qty: float, qtyToShip: float}}}
     */
    var getAvailableItems = function (readFromDom) {
        /**
         * We need a deep clone here, to avoid weird behaviour in intermediate
         * states (switching, deleting, creating packages)
         */
        var allSelections = deepClone(selections.getAll());

        if (readFromDom) {
            /**
             * We are most likely in an update loop here, where we can unfortunately not rely
             * on the selection.get() data, as the values are not yet available there.
             * Therefore we need to pull the updated values from the input components themselves.
             */
            var packageSelection = allSelections.find(function (selection) {
                return selection.packageId === currentPackage();
            });

            _.each(Object.keys(packageSelection['items']), function (itemId) {
                var qtyValue = getInputValueFromDom('qty', itemId);

                if (qtyValue !== "") {
                    packageSelection['items'][itemId]['details']['qty'] = Number(qtyValue);
                }
            });

            allSelections.splice(
                allSelections.findIndex(function (selection) {
                    return selection.packageId === currentPackage();
                }),
                1,
                packageSelection
            );
        }

        return getUnpackedItems(allSelections);
    };

    /**
     * Updates the allItemsPackaged observable depending on the current availability of items
     *
     * @param readFromDom - forces the availability to read qtys from the current input fields,
     *                      only necessary in edge cases
     */
    var updateItemAvailability = function (readFromDom) {
        allItemsPackaged(getAvailableItems(readFromDom).filter(function (item) {
            return item.qty > 0;
        }).length === 0);
    };

    /**
     * Create a new package in the selection data structure and prefill it with available items
     *
     * @param id
     */
    var createPackage = function (id) {
        var allSelections = selections.getAll();
        var availableItems = getAvailableItems(false);
        var packageSelection = {
            packageId: id,
            items: {}
        };

        _.each(availableItems, function (item) {
            var newItemSelection,
                existingPackageWithItem;

            if (Number(item.qty) === 0) {
                // items with only 0 qty available are not added to the new package.
                return;
            }

            existingPackageWithItem = _.find(allSelections, function (shipmentPackage) {
                return !!shipmentPackage.items[item.id];
            });

            /**
             * If we can find it, we use the item from an existing package as a template, only updating the qty.
             * So, the new package can inherit customized item values from previous packages.
             **/
            newItemSelection = existingPackageWithItem
                ? deepClone(existingPackageWithItem.items[item.id])
                : {details: {}};
            newItemSelection.details.qty = item.qty;
            newItemSelection.details.qtyToShip = item.qtyToShip;
            packageSelection['items'][item.id] = newItemSelection;
        });

        allSelections.push(packageSelection);
        selections.setAll(allSelections);
        allItemsPackaged(true);
    };

    /**
     * Remove a packages data presentation and switch the currently displayed data if necessary
     *
     * @param {{id: int}} selectedPackage
     * @return int package to switch to
     */
    var deletePackage = function (selectedPackage) {
        packages(packages().filter(function (item) {
            return item.id !== selectedPackage.id;
        }));

        /**
         * Filter all selections to actual packages (to prevent dangling entities)
         */
        var packageIds = packages().map(function (item) {return item.id;}),
            allSelections = selections.getAll().filter(function (selection) {
                return _.contains(packageIds, selection.packageId);
            });

        selections.setAll(allSelections);
        updateItemAvailability(false);
        if (currentPackage() === selectedPackage.id) {
            return packages().find(function () {return true;}).id;
        }

        return currentPackage();
    };

    /**
     * Handle switching selection data for package
     *
     * @param id {int}
     */
    var switchPackage = function (id) {
        var allSelections = selections.getAll();
        var packageSelection = allSelections.find(function (selection) {
            return selection.packageId === id;
        });

        selections.setAll(allSelections);
        selections.set(packageSelection);
        currentPackage(id);
    };

    /**
     * Creates a new package with unfilled data and switches current selections to it
     */
    var newPackage = function () {
        var newId = (_.max(packages(), function (item) {
            return item.id;
        }).id || 0) + 1;

        packages.push({"id": newId});
        createPackage(newId);
        switchPackage(newId);
    };

    return {
        currentPackage: currentPackage,
        packages: packages,
        newPackage: newPackage,
        switchPackage: switchPackage,
        deletePackage: deletePackage,
        getAvailableItems: getAvailableItems,
        updateItemAvailability: updateItemAvailability,
        allItemsPackaged: allItemsPackaged,
        reset: reset
    };
});
