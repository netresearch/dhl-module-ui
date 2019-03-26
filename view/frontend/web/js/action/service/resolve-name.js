define([
    'underscore',
    'Dhl_Ui/js/model/shipping-settings',
    'Dhl_Ui/js/model/checkout/service/service-codes',
], function (_, shippingSettings, serviceCodes) {
    'use strict';

    /**
     * Resolve a service code to a human-readable service label.
     *
     * @param {string} carrier
     * @param {string} code
     * @return {string|boolean} - will return false if the requested service does not exist
     */
    return function (carrier, code) {
        var carrierData = shippingSettings.getByCarrier(carrier),
            label = '';

        if (!carrierData) {
            return false;
        }

        /** @var {DhlService} matchingService */
        var matchingService = _.find(carrierData.service_data, function (service) {
            return service.code === serviceCodes.getServiceCode(code);
        });
        if (!matchingService) {
            return false;
        }

        label = matchingService.label;

        if (serviceCodes.isCompoundCode(code)) {
            var matchingInput = _.find(
                matchingService.inputs,
                function (input) {
                    return input.code === serviceCodes.getInputCode(code);
                }
            );
            if (matchingInput) {
                label += ' – ' + matchingInput.label
            }
        }

        return label;
    };
});
