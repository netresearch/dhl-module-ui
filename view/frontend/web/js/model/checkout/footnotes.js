define([
    'underscore',
    'Magento_Checkout/js/model/quote',
    'Dhl_Ui/js/model/checkout/service/service-selections',
    'Dhl_Ui/js/model/shipping-settings',
], function (_, quote, serviceSelections, shippingSettings) {
    'use strict';

    /**
     * @return {DhlCarrier|boolean}
     */
    var getCarrierData = function () {
        var carrierCode = quote.shippingMethod().carrier_code,
            carrierData = shippingSettings.getByCarrier(carrierCode);
        return carrierData ? carrierData : false;
    };

    return {
        /**
         * Filter footnotes from input array that should not be shown based on their meta data.
         *
         * @param {DhlFootnote[]} footnotes
         */
        filterAvailable: function (footnotes) {
            return footnotes.filter(this.shouldBeVisible);
        },

        /**
         * @param {DhlFootnote} footnote
         * @return {boolean}
         */
        shouldBeVisible: function (footnote) {
            if (footnote.subjects_must_be_selected) {
                var selectedSubjects = footnote.subjects.filter(function (subject) {
                    return serviceSelections.getServiceValue(subject);
                });

                return selectedSubjects ? selectedSubjects.length === footnote.subjects.length : false;
            }
            if (footnote.subjects_must_be_available) {
                var availableSubjects = getCarrierData().service_data.filter(function (service) {
                    return footnote.subjects.includes(service.code) && service.enabled_for_checkout;
                }.bind(footnote));

                return availableSubjects ? availableSubjects.length === footnote.subjects.length : false;
            }

            return true;
        },

        /**
         * @param {string} footnoteId
         * @return {DhlFootnote|boolean}
         */
        getById: function (footnoteId) {
            var match = getCarrierData().service_metadata.footnotes.find(function (footnote) {
                return footnote.id === footnoteId;
            });

            return match ? match : false;
        },

        /**
         * @param {string} footnoteId
         * @return {boolean}
         */
        isFootnoteVisible: function (footnoteId) {
            var footnote = this.getById(footnoteId);

            return footnote ? this.shouldBeVisible(footnote) : false;
        }
    };
});
