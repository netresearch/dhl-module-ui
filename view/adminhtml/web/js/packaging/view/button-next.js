define([
    'Magento_Ui/js/form/components/button',
    'uiRegistry',
    'Dhl_Ui/js/packaging/model/active-fieldset'
], function (Button, registry, activeFieldset) {
    'use strict';

    let fieldsetIndexes = [
        'dhl_fieldset_items',
        'dhl_fieldset_item_properties',
        'dhl_fieldset_package',
        'dhl_fieldset_services',
        'dhl_fieldset_summary',
    ];

    return Button.extend({
        /**
         * Executed when the button is clicked.
         */
        action: function () {
            this.changeActiveFieldset();
        },

        /**
         * Set the next fieldset as active
         *
         * @private
         */
        changeActiveFieldset: function () {
            let currentFieldset = registry.get({name: this.parent});
            let nextFieldset = fieldsetIndexes[fieldsetIndexes.indexOf(currentFieldset.index) + 1];
            if (nextFieldset) {
                activeFieldset.set(nextFieldset);
            }
        }
    })
});
