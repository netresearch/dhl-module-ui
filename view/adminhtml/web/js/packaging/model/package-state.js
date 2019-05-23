define([
    'ko'
], function (ko) {
    var packages = ko.observableArray([{"id": 0}]);

    var currentPackage = ko.observable(0);

    var newPackage = function (switchCurrent) {
        var new_id = packages().length;
        packages.push({"id": new_id});
        if (switchCurrent) {
            switchPackage(new_id)
        }
        return packages()[new_id];
    };

    var switchPackage = function (id) {
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

    return {
        currentPackage: currentPackage,
        packages: packages,
        newPackage: newPackage,
        switchPackage: switchPackage,
        nextSection: nextSection,
        currentSection: currentSection,
        sections: sections,
        switchSection: switchSection
    }
});
