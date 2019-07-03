define([
    'underscore',
    'Magento_Ui/js/form/components/fieldset',
    'uiLayout',
    'mageUtils',
    'uiRegistry',
    'Dhl_Ui/js/packaging/model/package-state'
], function (_, Component, layout, utils, registry, packageState) {
    'use strict';

    return Component.extend({
        defaults: {
            label: 'Package items',
            items: [],
            shippingOptions: [],
            activeFieldset: ''
        },
        fieldsetTemplate: {
            component: 'Dhl_Ui/js/packaging/view/item-properties-fieldset',
            name: '${ $.$data.id }',
            parent: '${ $.$data.parent }',
            label: '${ $.$data.itemName }',
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
                var fieldset = utils.template(this.fieldsetTemplate, {
                    parent: this.name,
                    id: itemOptionSet.item_id,
                    itemName: 'Item ' + itemOptionSet.item_id
                });
                fieldset.config = {
                    shippingOptions: itemOptionSet.shipping_options,
                    itemId: itemOptionSet.item_id
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
