define([
    'Dhl_Ui/js/model/shipping-option/selections'
], function (selections) {
    'use strict';

    var virtualInputCodes =  [
        'locationType',
        'locationNumber',
        'company',
        'street',
        'postalCode',
        'city',
        'countryCode',
        'locationId',
        'displayName'
    ];

    /**
     * This model can be used to sync a DhlLocation
     * with the customer's service selections.
     *
     * It creates virtual input selections as needed.
     */
    return {
        /**
         * @param {string} optionCode
         * @return {DhlLocation|null}
         */
        get: function (optionCode) {
            if (selections.getShippingOptionValue(optionCode, 'locationId')) {
                return {
                    shop_id: selections.getShippingOptionValue(optionCode, 'locationId'),
                    shop_type: selections.getShippingOptionValue(optionCode, 'locationType'),
                    shop_number: selections.getShippingOptionValue(optionCode, 'locationNumber'),
                    display_name: selections.getShippingOptionValue(optionCode, 'displayName'),
                    address: {
                        company: selections.getShippingOptionValue(optionCode, 'company'),
                        street: selections.getShippingOptionValue(optionCode, 'street'),
                        postal_code: selections.getShippingOptionValue(optionCode, 'postalCode'),
                        city: selections.getShippingOptionValue(optionCode, 'city'),
                        country_code: selections.getShippingOptionValue(optionCode, 'countryCode')
                    }
                };
            }

            return null;
        },

        /**
         * @param {string} optionCode
         * @param {DhlLocation} location
         */
        set: function (optionCode, location) {
            selections.addSelection(optionCode, 'locationType', location.shop_type);
            selections.addSelection(optionCode, 'locationNumber', location.shop_number);
            selections.addSelection(optionCode, 'company', location.address.company);
            selections.addSelection(optionCode, 'street', location.address.street);
            selections.addSelection(optionCode, 'postalCode', location.address.postal_code);
            selections.addSelection(optionCode, 'city', location.address.city);
            selections.addSelection(optionCode, 'countryCode', location.address.country_code);
            selections.addSelection(optionCode, 'locationId', location.shop_id);
            selections.addSelection(optionCode, 'displayName', location.display_name);
        },

        /**
         * @param {string} optionCode
         */
        reset: function (optionCode) {
            virtualInputCodes.forEach(function (inputCode) {
                selections.removeSelection(optionCode, inputCode);
            });
        }

    };
});
