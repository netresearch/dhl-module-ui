define([
    'underscore',
    'Magento_Ui/js/form/components/fieldset',
    'uiLayout',
    'mageUtils',
    'mage/translate',
    'uiRegistry',
    'Dhl_Ui/js/packaging/model/package-state',
    'Dhl_Ui/js/packaging/model/shipment-data',
    'Dhl_Ui/js/model/shipping-option/selections',
], function (_, Component, layout, utils, $t, registry, packageState, shipmentData, selections) {
    'use strict';

    var getItemsToDisplay = function () {
        var currentSelection = selections.get()(),
            availableItems = packageState.getAvailableItems(false);

        if (!_.isEmpty(currentSelection)) {
            _.each(currentSelection.items, function (itemSelection, itemId) {
                var item = availableItems.find(function (availableItem) {
                    return availableItem.id === Number(itemId);
                });

                item.qty += Number(itemSelection.details.qty);
            });
        }
        return availableItems.filter(function (item) {
            return Number(item.qty) > 0;
        }).map(function (item) {
            return Number(item.id);
        });
    };

    /**
     * @param {DhlItemOption} itemOption
     * @return {string}
     */
    var getItemName = function (itemOption) {
        /** @type DhlInput */
        var itemInput = _.findWhere(
            _.findWhere(
                itemOption.shipping_options,
                {code: 'details'}
            ).inputs,
            {code: 'productName'}
        );

        return itemInput.default_value ? itemInput.default_value : '';
    };

    return Component.extend({
        defaults: {
            label: $t('Package Items'),
            shippingOptions: [],
            activeFieldset: '',
            template: "Dhl_Ui/form/fieldset",
            title: $t('For editing package items click to enlarge')
        },

        initialize: function () {
            this._super();
            this.initChildComponents();
            return this;
        },

        /**
         * Filter the item options with the availability data of all previously taken selections,
         * so only items that are available/part of the current selection are listed
         */
        initChildComponents: function () {
            var itemFieldsets = [],
                itemsToDisplay = getItemsToDisplay(),
                applicableShippingOptions = this.shippingOptions.filter(function (itemSet) {
                    return _.contains(itemsToDisplay, itemSet.item_id);
                });

            this._super();

            _.each(applicableShippingOptions, /** @type DhlItemOption */ function (itemOption) {
                var fieldset = {
                    component: 'Dhl_Ui/js/packaging/view/item-properties-fieldset',
                    itemId: itemOption.item_id,
                    name: itemOption.item_id,
                    parent: this.name,
                    label: getItemName(itemOption),
                    additionalClasses: 'item-options',
                    shippingOptions: itemOption.shipping_options,
                    activeFieldset: '',
                    collapsible: itemsToDisplay.length > 1
                };

                itemFieldsets.push(fieldset);
            }.bind(this));

            layout(itemFieldsets);
        },

        onChildrenUpdate: function (hasChanged) {
            this._super(hasChanged);
            packageState.updateItemAvailability(true);
        }
    });
});
