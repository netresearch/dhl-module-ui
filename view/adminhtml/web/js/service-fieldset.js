define([
        "Magento_Ui/js/form/components/fieldset",
        "uiLayout",
    ], function (Component, layout) {
        return Component.extend({
            initialize: function () {
                this._super();
                this.initChildComponents();
            },

            /**
             * @private
             */
            initChildComponents: function () {
                let data = [];
                if (this.components) {
                    data = this.components;
                } else {
                    data = this.source.get(this.dataScope);
                    if (!data.hasOwnProperty('components')) {
                        return;
                    }
                    data = data.components;
                }
                let layouts = [];
                for (let input of data) {
                    input.parent = this.name;
                    layouts.push(input)
                }
                if (layouts.length > 0) {
                    layout(layouts);
                }
            }
        });
    }
);
