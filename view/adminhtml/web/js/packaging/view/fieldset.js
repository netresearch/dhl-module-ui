define([
    "Magento_Ui/js/form/components/fieldset",
    "Dhl_Ui/js/action/shipping-option/generate-components",
], function (Component, generateComponents) {
    'use strict';

    return Component.extend({
        defaults: {
            shippingOptions: [],
            activeFieldset: '',
            listens: {
                activeFieldset: 'handleActiveFieldsetChange',
            },
            additionalClasses: 'dhl-fieldset'
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
            generateComponents(this.shippingOptions, this.name, false);
        },

        handleActiveFieldsetChange: function (activeFieldset) {
            this.opened(activeFieldset === this.index);
        }

    });
});
