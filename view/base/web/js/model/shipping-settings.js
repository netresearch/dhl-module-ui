define([
    'ko',
    'Dhl_Ui/js/action/util/hash'
], function (ko, hash) {
    'use strict';
    /**
     * @callback DhlShippingSettingsObservable
     * @param {DhlShippingSettings} [value]
     * @return {DhlShippingSettings}
     *
     * @var {DhlShippingSettingsObservable} settings
     */
    var settings = ko.observable({});

    /**
     * Here come the type definitions of the DhlShippingSettings coming from the Magento REST endpoint.
     * They are defined in PHP at Dhl\ShippingCore\Api\Data\Checkout\CheckoutDataInterface
     *
     * @typedef {{carriers: DhlCarrier[]}} DhlShippingSettings
     *
     * @typedef {{
     *     code: string,
     *     compatibility_data: DhlCompatibility[],
     *     service_options: DhlShippingOption[],
     *     package_options: DhlShippingOption[],
     *     item_options: {item_id: int, shippingOptions: DhlShippingOption[]}[],
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
     *     trigger_value: string,
     *     action: string
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
     *     input_type: string,
     *     label: string,
      *    label_visible: bool,
     *     options: {label: string, value: string, disabled: boolean}
     *     disabled: boolean,
     *     placeholder: string,
     *     sort_order: int,
     *     tooltip: string,
     *     validation_rules: {name: string, params: mixed}[],
     *     item_combination_rule: DhlItemCombinationRule
     * }} DhlInput
     *
     * @typedef {{
     *     source_item_input_code: string,
     *     action: string,
     * }} DhlItemCombinationRule
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
            return settings;
        },

        /**
         * @param {DhlShippingSettings} data
         */
        set: function (data) {
            settings(data);
        },

        /**
         * @param {string} carrierName
         * @return {DhlCarrier|boolean}
         */
        getByCarrier: function (carrierName) {
            var carrierData;

            if ('carriers' in settings() === false) {
                return false;
            }

            carrierData = settings().carriers.find(function (carrier) {
                return carrier.code === carrierName;
            });

            return carrierData ? carrierData : false;
        },

        /**
         * Generates a numeric hash from the JSON string of the available data
         * @return {number}
         */
        getHash: function () {
            var jsonString = JSON.stringify(settings());
            return hash(jsonString);
        }
    };
});
