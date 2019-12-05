define([], function () {
    'use strict';

    /**
     * @typedef {{template: string, component: string}} InputType
     * @type {Object.<string, InputType>}
     */
    var templates = {
        hidden: {
            template: 'Dhl_Ui/form/element/hidden',
            component: 'Dhl_Ui/js/view/shipping-option-input'
        },
        text: {
            template: 'Dhl_Ui/form/element/input',
            component: 'Dhl_Ui/js/view/shipping-option-input'
        },
        number: {
            template: 'Dhl_Ui/form/element/number',
            component: 'Dhl_Ui/js/view/shipping-option-input'
        },
        prefixed: {
            template: 'Dhl_Ui/form/element/prefixed-text',
            component: 'Dhl_Ui/js/view/shipping-option-input'
        },
        suffixed: {
            template: 'Dhl_Ui/form/element/suffixed-text',
            component: 'Dhl_Ui/js/view/shipping-option-input'
        },
        checkbox: {
            template: 'Dhl_Ui/form/element/checkbox',
            component: 'Dhl_Ui/js/view/shipping-option-input'
        },
        radio: {
            template: 'Dhl_Ui/form/element/radio',
            component: 'Dhl_Ui/js/view/shipping-option-input'
        },
        radioset: {
            template: 'Dhl_Ui/form/element/radio',
            component: 'Dhl_Ui/js/view/shipping-option-input'
        },
        time: {
            template: 'Dhl_Ui/form/element/radio-styled',
            component: 'Dhl_Ui/js/view/shipping-option-input'
        },
        date: {
            template: 'Dhl_Ui/form/element/radio-styled',
            component: 'Dhl_Ui/js/view/shipping-option-input'
        },
        textarea: {
            template: 'Dhl_Ui/form/element/textarea',
            component: 'Dhl_Ui/js/view/shipping-option-input'
        },
        select: {
            template: 'Dhl_Ui/form/element/select',
            component: 'Dhl_Ui/js/view/shipping-option-input'
        },
        static: {
            template: 'Dhl_Ui/form/element/static',
            component: 'Dhl_Ui/js/view/shipping-option-input'
        },
        shopfinder: {
            template: 'Dhl_Ui/form/element/checkbox',
            component: 'Dhl_Ui/js/view/shipping-option-input'
        }
    };

    return {
        /**
         * Retrieve a template path for a type of template.
         *
         * @param {string} type
         * @return {InputType} - Will return false if no template path is configured for this type.
         */
        get: function (type) {
            if (templates[type]) {
                return templates[type];
            }

            if (type === false) {
                throw 'This type is not defined: ' + type;
            }
        }
    };
});
