define([
        "Magento_Ui/js/form/components/fieldset",
        "uiLayout",
    ], function (Component, layout) {
        return Component.extend({
            defaults: {
                selectedOrderItems: [],
                childComponents: [],
                imports: {
                    childComponents: '${ $.provider }:${ $.dataScope }.components',
                },
                links: {
                    selectedOrderItems: '${ $.provider }:${ $.dataScopeSelectedItems }',
                },
                listens: {
                    selectedOrderItems: 'handleChangedItemSelection',
                }
            },

            /**
             * @constructor
             * @return {exports}
             */
            initialize: function () {
                return this._super()
                .initChildComponents();
            },

            /**
             * Automatically create child components from a configuration json.
             *
             * @private
             */
            initChildComponents: function () {
                let layouts = [];
                for (let input of this.childComponents) {
                    input.parent = this.name;
                    layouts.push(input)
                }
                if (layouts.length > 0) {
                    layout(layouts);
                }
            },

            /**
             * Helper function to toggle visibility when selected order items change.
             * Is triggered depending on external component config.
             *
             * @param {string[]} items
             */
            handleChangedItemSelection: function (items) {
                if (this.orderItemId) {
                    this.visible(items.includes(this.orderItemId));
                }
            }
        });
    }
);
