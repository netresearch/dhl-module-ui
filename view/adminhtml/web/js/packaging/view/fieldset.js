define([
        "Magento_Ui/js/form/components/fieldset",
        "uiLayout",
    ], function (Component, layout) {
        return Component.extend({
            defaults: {
                childComponents: [],
                activeFieldset: '',
                imports: {
                    childComponents: '${ $.provider }:${ $.dataScope }.components',
                },
                links: {
                    activeFieldset: '${ $.provider }:data.active_fieldset',
                },
                listens: {
                    activeFieldset: 'handleActiveFieldsetChange',
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

            handleActiveFieldsetChange: function (activeFieldset) {
                this.opened(activeFieldset === this.index);
            }

        });
    }
);
