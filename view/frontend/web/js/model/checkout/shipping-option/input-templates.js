define([], function () {
    'use strict';

    /**
     * @type {Object}
     */
    var templates = {
        text: 'ui/form/element/input',
        number: 'ui/form/element/input',
        textarea: 'ui/form/element/textarea',
        checkbox: 'Dhl_Ui/checkout/form/element/checkbox',
        radio: 'Dhl_Ui/checkout/form/element/radio',
        radioset: 'Dhl_Ui/checkout/form/element/radio',
        time: 'Dhl_Ui/checkout/form/element/radio-styled',
        date: 'Dhl_Ui/checkout/form/element/radio-styled',
        select: 'Dhl_Ui/checkout/form/element/select'
    };

    return {
        /**
         * Retrieve a template path for a type of template.
         *
         * @param {string} type
         * @return {string|boolean} - Will return false if no template path is configured for this type.
         */
        get: function (type) {
            if (templates[type]) {
                return templates[type];
            }

            return false;
        }
    };
});
