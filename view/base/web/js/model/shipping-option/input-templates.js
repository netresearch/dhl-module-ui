define([], function () {
    'use strict';

    /**
     * @type {Object}
     */
    var templates = {
        hidden: 'Dhl_Ui/form/element/hidden',
        text: 'Dhl_Ui/form/element/input',
        number: 'Dhl_Ui/form/element/number',
        price: 'Dhl_Ui/form/element/price',
        checkbox: 'Dhl_Ui/form/element/checkbox',
        radio: 'Dhl_Ui/form/element/radio',
        radioset: 'Dhl_Ui/form/element/radio',
        time: 'Dhl_Ui/form/element/radio-styled',
        date: 'Dhl_Ui/form/element/radio-styled',
        textarea: 'Dhl_Ui/form/element/textarea',
        select: 'Dhl_Ui/form/element/select',
        static: 'Dhl_Ui/form/element/static'
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
