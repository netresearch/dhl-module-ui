define([
    'underscore',
    'ko',
    'Dhl_Ui/js/model/shipping-option/selections',
    'Dhl_Ui/js/packaging/action/get-unpacked-items',
    'uiRegistry'
], function (_, ko, selections, getUnpackedItems, registry) {
    var packages = ko.observableArray([{"id": 1}]);
    var currentPackage = ko.observable(1);
    var allItemsPackaged = ko.observable(true);

    /**
     * Creates a new package with unfilled data and switches current selections to it
     */
    var newPackage = function () {
        var new_id = packages().reduce((carry, e) => Math.max(carry, e.id), 1) + 1;
        packages.push({"id": new_id});
        switchPackage(new_id)
    };

    /**
     * Remove a packages data presentation and switch the currently displayed data if necessary
     *
     * @param {{id: int}} package
     * @return int package to switch to
     */
    var deletePackage = function (package) {
        packages(packages().filter((item) => item.id !== package.id));

        /**
         * Filter all selections to actual packages (to prevent dangling entities)
         */
        var packageIds = packages().map((item) => item.id);
        var allSelections = selections.getAll().filter((selection) => _.contains(packageIds, selection.packageId));
        selections.setAll(allSelections);
        updateItemAvailability(false);
        if (currentPackage() === package.id) {
            return packages().find(() => true).id;
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
        var packageSelection = allSelections.find((selection) => selection.packageId === id);
        if (!packageSelection) {
            /**
             * If the package id requested is not yet available, create a new selections object for it and add it
             * to the selections data
             */
            var availableItems = getAvailableItems(true);
            packageSelection = {packageId: id, items: {}};
            _.each(availableItems, function (item) {
                packageSelection['items'][item.id] = {'details': {'qty': item.qty}};
            });
            allSelections.push(packageSelection);
            allItemsPackaged(true);
        }
        selections.setAll(allSelections);
        selections.set(packageSelection);
        currentPackage(id);
    };


    /**
     * Goes through all selection data and extracts the unpackaged items
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
                packageSelection['items'][itemId]['details']['qty'] = Number(inputElement.value());
            }
            allSelections.splice(allSelections.findIndex((selection) => selection.packageId === currentPackage()), 1, packageSelection);
        }

        return getUnpackedItems(allSelections);
    };

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
        allItemsPackaged: allItemsPackaged
    }
});
