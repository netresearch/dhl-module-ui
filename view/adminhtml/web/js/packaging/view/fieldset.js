define([
        "Magento_Ui/js/form/components/fieldset",
        "uiLayout",
        'Dhl_Ui/js/packaging/model/active-fieldset'
    ], function (Component, layout, activeFieldset) {
        return Component.extend({
            initialize: function () {
                this._super();
                this.initChildComponents();

                activeFieldset.get().subscribe(function (fieldset) {
                    if (this.index === fieldset) {
                        this.opened(true)
                    } else {
                        this.opened(false)
                    }
                }.bind(this))
            },

            /**
             * Automatically create child components from a configuration json.
             * Uses the "components" property of itself (useful for nested components) or its data source.
             *
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
