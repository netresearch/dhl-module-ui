define([
    'ko',
], function (ko) {
    'use strict';

    /**
     * @callback DhlShippingSettingsObservable
     * @param {DhlShippingSettings} [value]
     * @return {DhlShippingSettings}
     *
     * @var {DhlShippingSettingsObservable} checkoutData
     */
    var checkoutData = ko.observable({});

    /**
     * Here come the type definitions of the DhlShippingSettings coming from the Magento REST endpoint.
     * They are defined in PHP at Dhl\ShippingCore\Api\Data\Checkout\CheckoutDataInterface
     *
     * @typedef {{carriers: DhlCarrier[]}} DhlShippingSettings
     *
     * @typedef {{
     *     code: string,
     *     compatibility_data: DhlCompatibility[],
     *     package_level_options: DhlShippingOption[],
     *     metadata: {
     *         comments_after: DhlComment[],
     *         comments_before: DhlComment[],
     *         image_url: string,
     *         title: string,
     *         footnotes: DhlFootnote[],
     *     }
     * }} DhlCarrier
     *
     * @typedef {{
     *     content: string,
     *     id: string,
     *     subjects: string[],
     *     subjects_must_be_selected: boolean,
     *     subjects_must_be_available: boolean,
     * }} DhlFootnote
     *
     * @typedef {{
     *     subjects: string[],
     *     error_message: string,
     *     masters: string[],
     *     incompatibility_rule: boolean,
     *     hide_subjects: boolean,
     * }} DhlCompatibility
     *
     * @typedef {{
     *     available_at_postal_facility: boolean,
     *     code: string,
     *     inputs: DhlInput[],
     *     label: string,
     *     packaging_readonly: boolean,
     *     sort_order: int,
     * }} DhlShippingOption
     *
     * @typedef {{
     *     code: string,
     *     comment: DhlComment,
     *     default_value: string,
     *     disabled: boolean,
     *     input_type: string,
     *     label: string,
      *    label_visible: bool,
     *     options: {label: string, value: string, disabled: boolean}
     *     placeholder: string,
     *     sort_order: int,
     *     tooltip: string,
     *     validation_rules: {name: string, param: mixed}[],
     * }} DhlInput
     *
     * @typedef {{
     *     content: string,
     *     footnote_id: string,
     * }} DhlComment
     */

    return {
        /**
         * @return {DhlShippingSettingsObservable}
         */
        get: function () {
            return checkoutData;
        },

        /**
         * @param {DhlShippingSettings} data
         */
        set: function (data) {
            checkoutData(data)
        },

        /**
         * @param {string} carrierName
         * @return {DhlCarrier|boolean}
         */
        getByCarrier: function (carrierName) {
            if ('carriers' in checkoutData() === false) {
                return false;
            }
            var carrier = checkoutData().carriers.find(function (carrier) {
                return carrier.code === carrierName;
            });

            return carrier ? carrier : false;
        }
    };
});
