define([
    'underscore',
    'Dhl_Ui/js/model/checkout/checkout-data',
], function (_, checkoutData) {
    'use strict';

    /**
     * Resolve a service code to a human-readable service label.
     *
     * @param {string} carrier
     * @param {string} code
     * @return {string|boolean} - will return false if the requested service does not exist
     */
    return function (carrier, code) {
        var carrierData = checkoutData.getByCarrier(carrier),
            codes = code.split('.'),
            serviceCode = codes.shift(),
            inputCode = codes.shift(),
            label = '';

        if (!carrierData) {
            return false;
        }

        /** @var {DhlService} matchingService */
        var matchingService = _.find(carrierData.service_data, function (service) {
            return service.code === serviceCode;
        });
        if (!matchingService) {
            return false;
        }

        label = matchingService.label;

        if (inputCode) {
            var matchingInput = _.find(matchingService.inputs, function (input) {
                return input.code === inputCode;
            });
            if (matchingInput) {
                label += ' – ' + matchingInput.label
            }
        }

        return label;
    };
});
