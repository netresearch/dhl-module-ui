define([
    'underscore',
    'ko',
    'Dhl_Ui/js/model/shipping-option/selections',
    'Dhl_Ui/js/packaging/action/get-unpacked-items',
    'uiRegistry'
], function (_, ko, selections, getUnpackedItems, registry) {
    var packages = ko.observableArray([{"id": 0}]);
    var currentPackage = ko.observable(0);
    var allItemsPackaged = ko.observable(true);

    var newPackage = function (switchCurrent) {
        var new_id = packages().reduce((carry,e) => Math.max(carry, e.id), 0) + 1;
        packages.push({"id": new_id});

        if (switchCurrent) {
            switchPackage(new_id)
        }
        return packages()[new_id];
        //@TODO transfer available package items as preselection to new package selections
    };

    /**
     *
     * @param {{id: int}}package
     */
    var deletePackage = function (package) {
        packages.splice(packages.indexOf(package));
        var allSelections = selections.getAll();
        allSelections.splice(allSelections.findIndex((selection) => selection.packageId === package.id), 0);
        selections.setAll(allSelections);
        if (currentPackage() === package.id) {
            switchPackage(packages().find(() => true).id)
        }
        updateItemAvailability();
    };

    var getSelectionsWithCurrent = function () {
        var allSelections = selections.getAll();
        allSelections.splice(allSelections.findIndex((selection) => selection.packageId === selections.get()().packageId), 1, selections.get()());
        return allSelections;
    };

    var switchPackage = function (id) {
        var allSelections = getSelectionsWithCurrent();
        var packageSelection = allSelections.find((selection) => selection.packageId === id);
        if (!packageSelection) {
            var availableItems = getAvailableItems(true);
            packageSelection = {packageId: id, items: {}};
            _.each(availableItems, function (item) {
                selection['items'][item.id] = {'details': {'qty': item.qty}};
            });
            allSelections.push(packageSelection);
        }
        selections.setAll(allSelections);
        selections.set(packageSelection);
        currentPackage(id);
        updateItemAvailability();
    };


    var getAvailableItems = function (withUnavailable) {
        var allSelections = getSelectionsWithCurrent();
        /**
         * We are in an update loop here, where we can unfortunately not rely on the selection.get() data, as the
         * values are not yet available there. Therefore we need to pull the updated values from the input components themselves
         */
        var packageSelection = allSelections.find((selection) => selection.packageId === currentPackage());
        for (var itemId in packageSelection['items']) {
            var inputElement = registry.get('inputCode = qty, itemId = ' + itemId);
            packageSelection['items'][itemId]['details']['qty'] = Number(inputElement.value());
        }
        allSelections.splice(allSelections.findIndex((selection) => selection.packageId === currentPackage()), 1, packageSelection);

        return getUnpackedItems(allSelections, withUnavailable);
    };

    var updateItemAvailability = function () {
        allItemsPackaged(getAvailableItems().length === 0);
    };

    return {
        currentPackage: currentPackage,
        packages: packages,
        newPackage: newPackage,
        switchPackage: switchPackage,
        nextSection: nextSection,
        currentSection: currentSection,
        sections: sections,
        switchSection: switchSection,
        getAvailableItems: getAvailableItems,
        updateItemAvailability: updateItemAvailability,
        allItemsPackaged: allItemsPackaged
    }
});
