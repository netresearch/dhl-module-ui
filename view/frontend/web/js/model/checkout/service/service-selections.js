define([
    'underscore',
    'ko',
    'Magento_Checkout/js/model/quote',
    'Dhl_Ui/js/model/checkout/storage'
], function (_, ko, quote, storage) {
    'use strict';

    /**
     * @return {string}
     */
    var getCurrentCarrier = function () {
        return quote.shippingMethod().carrier_code;
    };

    /**
     * @callback DhlServiceSelectionObservable
     * @param {*[][][]} [value]
     * @return {*[][][]}
     *
     * @property DhlServiceSelectionObservable
     */
    var services = storage.get('cachedServiceValues') ? ko.observable(storage.get('cachedServiceValues')) : ko.observable({});

    return {

        /**
         * @return {DhlServiceSelectionObservable}
         */
        get: function () {
            return services;
        },

        /**
         * @return {*[][][]|null}
         */
        getByCarrier: function () {
            var carrier = getCurrentCarrier();
            if (!(carrier in services())) {
                return null;
            }
            return services()[carrier];
        },

        /**
         * Get service value by name and optionally by input code.
         *
         * Service values are stored separately by carrier.
         *
         * @param {string} name
         * @param {string} [code]
         * @return {string|string[]|undefined} Service input value(s) or null if service not found
         */
        getServiceValue: function (name, code) {
            var carrierData = this.getByCarrier();
            if (!carrierData || !(name in carrierData)) {
                return null
            }

            var service = carrierData[name];
            if (!code) {
                return service;
            } else if (code in service) {
                return service[code]
            } else {
                return null;
            }
        },

        /**
         * Collect all selected services and inputs in dot-separated format.
         *
         * @return {string[]}
         */
        getServiceValuesInCompoundFormat: function () {
            var selectedServiceCodes = [];
            _.each(this.getByCarrier(), function (values, serviceCode) {
                selectedServiceCodes.push(serviceCode);
                _.each(values, function (value, inputCode) {
                    selectedServiceCodes.push([serviceCode, inputCode].join('.'))
                })
            });

            return selectedServiceCodes;
        },

        /**
         * Add a service value. Service values are stored separately by carrier.
         *
         * @param {string} name
         * @param {string} code
         * @param {*} value
         */
        addService: function (name, code, value) {
            var carrier = getCurrentCarrier(),
                workingCopy = services();
            if (workingCopy[carrier] == undefined) {
                workingCopy[carrier] = {};
            }
            if (workingCopy[carrier][name] == undefined) {
                workingCopy[carrier][name] = {};
            }
            workingCopy[carrier][name][code] = value;
            storage.set('cachedServiceValues', workingCopy);
            services(workingCopy);
        },

        /**
         * Remove a service value. Service values are stored separately by carrier.
         *
         * @param {string} name
         * @param {string} code
         */
        removeService: function (name, code) {
            var carrier = getCurrentCarrier(),
                workingCopy = services();
            delete workingCopy[carrier][name][code];
            if (_.isEmpty(workingCopy[carrier][name])) {
                delete workingCopy[carrier][name];
                if (_.isEmpty(workingCopy[carrier])) {
                    delete workingCopy[carrier];
                }
            }
            storage.set('cachedServiceValues', workingCopy);
            services(workingCopy);
        }
    };
});
