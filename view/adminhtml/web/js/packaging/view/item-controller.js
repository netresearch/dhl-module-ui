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
            _.each(this.shippingOptions, function (itemOptionSet, id) {
                var fieldset = utils.template(this.fieldsetTemplate, {
                    parent: this.name,
                    id: id,
                    itemName: 'Item' + id
                });
                fieldset.config = {
                    shippingOptions: itemOptionSet,
                    itemId: id
                };
                itemFieldsets.push(fieldset);
            }, this);

            layout(itemFieldsets);
        },

        onChildrenUpdate: function (hasChanged) {
            this._super(hasChanged);
            packageState.updateItemAvailability();
        }
    });
});
