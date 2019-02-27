define([
    'ko',
], function (ko) {
    'use strict';

    /**
     * @callback DhlShippingSettingsObservable
     * @param {DhlShippingSettings} [value]
     * @return {DhlShippingSettings}
     */

    /**
     * @var {DhlShippingSettingsObservable} checkoutData
     */
    var checkoutData = ko.observable({});

    /**
     * Here come the type definitions of the DhlShippingSettings coming from the Magento REST endpoint.
     * They are defined in PHP at Dhl\ShippingCore\Api\Data\Checkout\CheckoutDataInterface
     *
     * @typedef {{carriers: DhlCarrier[]}} DhlShippingSettings
     */

    /**
     * @typedef {{
     *     carrier_code: string,
     *     service_compatibility_data: DhlCompatibility[],
     *     service_data: DhlService[],
     *     service_metadata: {
     *         comments_after: DhlComment,
     *         comments_before: DhlComment,
     *         image_url: string,
     *         title: string,
     *         footnotes: DhlFootnote[],
     *     }
     * }} DhlCarrier
     */

    /**
     * @typedef {{
     *     content: string,
     *     id: string,
     *     subjects: string[],
     *     subjects_must_be_selected: boolean,
     *     subjects_must_be_available: boolean,
     * }} DhlFootnote
     */

    /**
     * @typedef {{
     *     incompatibility_rule: boolean,
     *     subjects: string[],
     *     error_message: string,
     * }} DhlCompatibility
     */

    /**
     * @typedef {{
     *     available_at_postal_facility: boolean,
     *     code: string,
     *     enabled_for_autocreate: boolean,
     *     enabled_for_checkout: boolean,
     *     enabled_for_packaging: boolean,
     *     inputs: DhlInput[],
     *     label: string,
     *     packaging_readonly: boolean,
     *     routes: {string},
     *     sort_order: int,
     * }} DhlService
     */

     /**
     * @typedef {{
     *     code: string,
     *     comment: DhlComment,
     *     default_value: string,
     *     input_type: string,
     *     label: string,
      *    label_visible: bool,
     *     options: {label: string, value: string, disabled: boolean}
     *     placeholder: string,
     *     sort_order: int,
     *     tooltip: string,
     *     validation_rules: {name: string, params: string[]}[],
     * }} DhlInput
     */

    /**
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
                return carrier.carrier_code === carrierName;
            });

            return carrier ? carrier : false;
        }
    };
});
