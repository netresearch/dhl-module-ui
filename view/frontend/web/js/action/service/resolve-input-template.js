define([], function () {
    'use strict';

    /**
     * @type {{date: string, checkbox: string, text: string, time: string}}
     */
    var templates = {
        text: 'ui/form/element/input',
        checkbox: 'Dhl_Ui/checkout/form/element/checkbox',
        radio: 'Dhl_Ui/checkout/form/element/radio',
        radioset: 'Dhl_Ui/checkout/form/element/radio',
        time: 'Dhl_Ui/checkout/form/element/radio-styled',
        date: 'Dhl_Ui/checkout/form/element/radio-styled'
    };

    /**
     * @param {string} type
     * @return {string|false}
     */
    return function (type) {
        if (templates[type]) {
            return templates[type];
        }

        return false;
    };
});
