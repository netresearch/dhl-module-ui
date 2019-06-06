define([
    'underscore',
    'ko',
    'Dhl_Ui/js/model/shipping-option/selections',
    'Dhl_Ui/js/packaging/action/get-unpacked-items',
    'uiRegistry'
], function (_, ko, selections, getUnpackedItems, registry) {
    var packages = ko.observableArray([{"id": 0}]);

    var currentPackage = ko.observable(0);

    var newPackage = function (switchCurrent) {
        var new_id = packages().length;
        packages.push({"id": new_id});
        if (switchCurrent) {
            switchPackage(new_id)
        }
        return packages()[new_id];
        //@TODO transfer available package items as preselection to new package selections
    };

    var switchPackage = function (id) {
        var allSelections = selections.getAll();
        allSelections[currentPackage()] = selections.get()();
        selections.setAll(allSelections);
        if (!selections[id]) {
            selections[id] = ko.observable({});
        }
        var newSelection = allSelections[id];
        selections.set(newSelection);
        currentPackage(id);
    };

    var sections = [];

    var currentSection = ko.observable('package');

    var switchSection = function (section) {
        currentPackage(section);
    };

    var nextSection = function () {
        var index = min(sections.indexOf(currentSection()) + 1, sections.length - 1);
        switchSection(sections[index])
    };

    var allItemsPackaged = ko.observable(true);

    var getAvailableItems = function () {
        var allSelections = selections.getAll();
        allSelections[currentPackage()] = selections.get()();
        for (var itemId in allSelections[currentPackage()]['items']) {
            var inputElement = registry.get('inputCode = qty, itemId = ' + itemId);
            allSelections[currentPackage()]['items'][itemId]['details']['qty'] = Number(inputElement.value());
        }

        return getUnpackedItems(allSelections);
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
