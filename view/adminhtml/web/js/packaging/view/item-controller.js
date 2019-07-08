define([
    'underscore',
    'Magento_Ui/js/form/components/fieldset',
    'uiLayout',
    'mageUtils',
    'mage/translate',
    'uiRegistry',
    'Dhl_Ui/js/packaging/model/package-state'
], function (_, Component, layout, utils, $t, registry, packageState) {
    'use strict';

    return Component.extend({
        defaults: {
            label: $t('Package Items'),
            items: [],
            shippingOptions: [],
            activeFieldset: '',
            additionalClasses: 'dhl-all-items'
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
                var fieldset = utils.template(this.fieldsetTemplate, {
                    parent: this.name,
                    id: itemOptionSet.item_id,
                    itemName: $t('Item ') + itemOptionSet.item_id
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
