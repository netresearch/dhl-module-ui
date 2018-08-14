define([
    'uiRegistry',
    'uiLayout',
], function (registry, layout) {
    /**
     * @private
     * @param {int[]} items
     * @param {string[]} itemNames
     */
    function buildOptions(items, itemNames) {
        let options = [];
        items.forEach(function (id) {
            options.push({
                label: itemNames[id],
                value: id,
            });
        });

        return options;
    }

    /**
     * @private
     */
    function removeItems(parentName) {
        registry.get(parentName, function (component) {
            component.destroyChildren()
        });
    }

    /**
     * When changing the number of items available in the packaging popup, it is necessary to rebuild the packing items
     * checkbox set. This action removes the content of 'dhl_fieldset_items' and reinserts the checkbox set with new
     * options and re-adds the 'next' button.
     *
     * @public
     * @param {int[]} items        The orderItemIds that should be included in the new items list
     * @param {string} parentName  The name of the UI Component where the item should be added.
     * @param {string[]} itemNames An index of Item names to label the items correctly.
     */
    return function (items, parentName, itemNames) {
        removeItems(parentName);

        let checkboxSet = {
            nodeTemplate: parentName + '.dhl_order_items',
            options: buildOptions(items, itemNames),
        };
        let button = {
            nodeTemplate: parentName + '.buttonNext',
        };

        layout([checkboxSet, button]);
    }
});
