define([
        "Magento_Ui/js/form/components/fieldset",
        "uiLayout",
    ], function (Component, layout) {
        return Component.extend({
            initialize: function () {
                this._super();

                let layouts = [];
                for (let input of this.source.get(this.dataScope)) {
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
