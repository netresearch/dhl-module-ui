define([
        "Magento_Ui/js/form/form",
        'Magento_Ui/js/lib/spinner',
    ], function (Component, loader) {
        return Component.extend({
            /** @TODO: handle form flow, provide save callback etc. */
            initialize: function () {
                this._super();
            },

            /**
             * Hide loader.
             * Overriden to get around obtuse spinner naming problem with the parent class.
             * @TODO: Figure out how this Component needs to be configured to work automatically.
             *
             * @returns {Object}
             */
            hideLoader: function () {
                loader.get(this.name + '.dhl_packaging_popup_spinner').hide();

                return this;
            },
        });
    }
);
