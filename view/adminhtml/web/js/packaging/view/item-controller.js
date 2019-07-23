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
        var currentSelection = selections.get()();
        var availableItems = packageState.getAvailableItems(false);
        if (!_.isEmpty(currentSelection)) {
            _.each(currentSelection.items, function (itemSelection, itemId) {
                var item = availableItems.find((item) => item.id === itemId);
                item.qty += Number(itemSelection.details.qty);
            });
        }
        return availableItems.filter((item) => Number(item.qty) > 0).map((item) => Number(item.id));
    };

    return Component.extend({
        defaults: {
            label: $t('Package Items'),
            items: [],
            shippingOptions: [],
            activeFieldset: '',
            template: "Dhl_Ui/form/fieldset",
            title: $t('For editing package items click to enlarge')
        },
        fieldsetTemplate: {
            component: 'Dhl_Ui/js/packaging/view/item-properties-fieldset',
            name: '${ $.$data.id }',
            parent: '${ $.$data.parent }',
            label: '${ $.$data.itemName }',
            additionalClasses: 'item-options',
            config: {
                shippingOptions: [],
                activeFieldset: ''
            }
        },

        initialize: function () {
            this._super();
            this.initChildComponents();
            return this;
        },

        initChildComponents: function () {
            this._super();
            var itemFieldsets = [],
                itemsToDisplay = getItemsToDisplay();
            /**
             * Filter the item options with the availability data of all previously taken selections,
             * so only items that are available/part of the current selection are listed
             */
            _.each(this.shippingOptions.filter((itemSet) => _.contains(itemsToDisplay, itemSet.item_id)), function (itemOptionSet) {
                var items = shipmentData.getItems(),
                    itemData = items.find((item) => Number(item.id) === itemOptionSet.item_id),
                    fieldset = utils.template(this.fieldsetTemplate, {
                        parent: this.name,
                        id: itemOptionSet.item_id,
                        itemName: itemData.productName
                    });
                fieldset.config = {
                    shippingOptions: itemOptionSet.shipping_options,
                    itemId: itemOptionSet.item_id,
                    collapsible: itemsToDisplay.length > 1
                };
                itemFieldsets.push(fieldset);
            }, this);

            layout(itemFieldsets);
        },

        onChildrenUpdate: function (hasChanged) {
            this._super(hasChanged);
            packageState.updateItemAvailability(true);
        }
    });
});
