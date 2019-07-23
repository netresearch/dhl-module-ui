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
     * Resets the whole package state, dismissing all existent data.
     */
    var reset = function () {
        packages([]);
        currentPackage(0);
        allItemsPackaged(false);
    };

    /**
     * Creates a new package with unfilled data and switches current selections to it
     */
    var newPackage = function () {
        var new_id = (_.max(packages(), (item) => item.id).id || 0) + 1;
        packages.push({"id": new_id});
        createPackage(new_id);
        switchPackage(new_id)
    };

    /**
     * Remove a packages data presentation and switch the currently displayed data if necessary
     *
     * @param {{id: int}} selectedPackage
     * @return int package to switch to
     */
    var deletePackage = function (selectedPackage) {
        packages(packages().filter((item) => item.id !== selectedPackage.id));

        /**
         * Filter all selections to actual packages (to prevent dangling entities)
         */
        var packageIds = packages().map((item) => item.id);
        var allSelections = selections.getAll().filter((selection) => _.contains(packageIds, selection.packageId));
        selections.setAll(allSelections);
        updateItemAvailability(false);
        if (currentPackage() === selectedPackage.id) {
            return packages().find(() => true).id;
        }

        return currentPackage();
    };

    /**
     * Create a new package in the selection data structure and prefill it with available items
     *
     * @param id
     */
    var createPackage = function (id) {
        var allSelections = selections.getAll();
        var availableItems = getAvailableItems(false);
        // @TODO: fill in additional initial package values, preferably via hook
        var packageSelection = {
            packageId: id,
            items: {},
            package: {
                packageDetails: {
                    weight: _.reduce(availableItems, (carry, item) => carry + Number(item.qty) * Number(item.weight), 0)
                },
                packageCustoms: {
                    customsValue: _.reduce(availableItems, (carry, item) => carry + Number(item.qty) * Number(item.price), 0)
                }
            }
        };
        _.each(availableItems, function (item) {
            if (Number(item.qty) > 0) {
                packageSelection['items'][item.id] = {'details': {'qty': item.qty, 'qtyToShip': item.qtyToShip}};
            }
        });
        allSelections.push(packageSelection);
        selections.setAll(allSelections);
        allItemsPackaged(true);
    };

    /**
     * Handle switching selection data for package
     *
     * @param id {int}
     */
    var switchPackage = function (id) {
        var allSelections = selections.getAll();
        var packageSelection = allSelections.find((selection) => selection.packageId === id);
        selections.setAll(allSelections);
        selections.set(packageSelection);
        currentPackage(id);
    };

    /**
     * Goes through all selection data and extracts the unpacked items
     *
     * @param readFromDom {boolean|undefined}  - if true the selections will be read from the actual input components
     * @returns {{{id: int, qty: float}}}
     */
    var getAvailableItems = function (readFromDom) {
        /**
         * We need a deep clone here, to avoid weird behaviour in intermediate states (switching, deleting, creating packages)
         */
        var allSelections = JSON.parse(JSON.stringify(selections.getAll()));
        if (readFromDom) {
            /**
             * We are most likely in an update loop here, where we can unfortunately not rely on the selection.get() data, as the
             * values are not yet available there. Therefore we need to pull the updated values from the input components themselves
             */
            var packageSelection = allSelections.find((selection) => selection.packageId === currentPackage());
            for (var itemId in packageSelection['items']) {
                var inputElement = registry.get('inputCode = qty, itemId = ' + itemId);
                if (inputElement) {
                    packageSelection['items'][itemId]['details']['qty'] = Number(inputElement.value());
                }
            }
            allSelections.splice(allSelections.findIndex((selection) => selection.packageId === currentPackage()), 1, packageSelection);
        }

        return getUnpackedItems(allSelections);
    };

    /**
     * Updates the allItemsPackaged observable depending on the current availability of items
     *
     * @param readFromDom - forces the availability to read qtys from the current input fields, only necessary in edge cases
     */
    var updateItemAvailability = function (readFromDom) {
        allItemsPackaged(getAvailableItems(readFromDom).filter((item) => item.qty > 0).length === 0);
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
    }
});
