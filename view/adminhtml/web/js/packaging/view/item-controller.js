define([
    'Magento_Ui/js/form/components/fieldset',
    'uiLayout',
    'mageUtils'
], function (Component, layout, utils) {
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
            label: '${ $.$data.product_name }',
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
            this.shippingOptions.forEach(function (itemOptionSet) {
                var fieldset = utils.template(this.fieldsetTemplate, {
                    parent: this.name,
                    id: itemOptionSet.id
                });
                fieldset.config = {
                    shippingOptions: itemOptionSet.shipping_options
                };
                itemFieldsets.push(fieldset);
            }.bind(this));

            layout(itemFieldsets);
        }
    });
});
