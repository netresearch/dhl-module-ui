define([
    'underscore',
    'Dhl_Ui/js/model/shipping-option/selections',
    'uiRegistry'
], function (_, selectionsModel, registry) {
    'use strict';

    /**
     * Get the total remaining qty for the given item in the given package.
     *
     * @param {{packageId: int, items: {}, package: {}}} selections
     * @param {int} itemId
     *
     * @return int
     */
    var getRemainingShippableQty = function (selections, itemId) {
        var currentPackageId = selections.packageId,
            totalQty = selections.items[itemId].details.qtyToShip,
            allPackages = selectionsModel.getAll(),
            otherPackages = _.filter(allPackages, function (singlePackage) {
                return singlePackage.packageId !== currentPackageId;
            }),
            qtyInOtherPackages;

        if (!otherPackages.length) {
            return totalQty;
        }
        qtyInOtherPackages = _.reduce(otherPackages, function (memo, singlePackage) {
            if (singlePackage.items[itemId]) {
                return memo + Number(singlePackage.items[itemId].details.qty);
            }
            return memo;
        }, 0);

        return totalQty - qtyInOtherPackages;
    };

    /**
     * Determine if the itemId is the only one in this package
     *
     * @param {{packageId: int, items: {}, package: {}}} selections
     * @param {string} itemId
     *
     * @return {boolean}
     */
    var isLastItemInPackage = function (selections, itemId) {
        var onlyCurrentItemInPackage = Object.keys(selections.items).length === 1
            && Object.keys(selections.items)[0] === itemId,
            otherItemsQty = 0;

        if (!onlyCurrentItemInPackage) {
            otherItemsQty = _.reduce(selections.items, function (memo, item, key) {
                if (key !== itemId) {
                    return memo + Number(item.details.qty);
                }
                return memo;
            }, 0);
        }
        return onlyCurrentItemInPackage || otherItemsQty === 0;
    };

    /**
     * Remove the qty input options that are out of range of the actual remaining qty.
     *
     * @param {{packageId: int, items: {}, package: {}}} selections
     * @param {{}} component
     * @param {int} itemId
     */
    var updateOptions = function(selections, component, itemId) {
        var maxQty = getRemainingShippableQty(selections, itemId),
            isLastItem = isLastItemInPackage(selections, itemId),
            options;

        /** Generate options for the available range of values **/
        options = _.map(_.range(maxQty + 1), function (value) {
                return {
                    id: String(value),
                    value: String(value),
                    label: String(value),
                };
            });

        options = _.filter(options, function (option) {
            /** For the last item in a package, we don't allow a qty of 0 */
            return !(isLastItem && option.value === '0');
        });

        component.options(options);


    };

    /**
     * Handle the generation of the correct qty field options to
     * - avoid packing more qty than available
     * - avoid empty packages
     */
    return function (selections) {
        if (!selections.items) {
            return;
        }
        _.each(Object.keys(selections.items), function (itemId) {
            registry.get({
                component: 'Dhl_Ui/js/view/shipping-option-input',
                inputCode: 'qty',
                itemId: itemId
            }, function (component) {
                updateOptions(selections, component, itemId);
            });
        });
    };
});
