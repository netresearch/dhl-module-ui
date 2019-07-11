define([
    'underscore',
    'Magento_Ui/js/form/components/fieldset',
    'uiLayout',
    'mageUtils',
    'mage/translate',
    'uiRegistry',
    'Dhl_Ui/js/packaging/model/package-state',
    'Dhl_Ui/js/packaging/model/shipment-data'
], function (_, Component, layout, utils, $t, registry, packageState, shipmentData) {
    'use strict';

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
            var itemFieldsets = [];
            _.each(this.shippingOptions, function (itemOptionSet) {
                var items = shipmentData.getItems(),
                    itemData = items.find((item)=> Number(item.id) === itemOptionSet.item_id),
                    itemCount = items.length,
                    collapse = itemCount > 1,
                    fieldset = utils.template(this.fieldsetTemplate, {
                    parent: this.name,
                    id: itemOptionSet.item_id,
                    itemName: itemData.productName
                });
                fieldset.config = {
                    shippingOptions: itemOptionSet.shipping_options,
                    itemId: itemOptionSet.item_id,
                    collapsible: collapse
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
