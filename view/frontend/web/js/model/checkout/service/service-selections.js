define([
    'underscore',
    'ko',
    'Dhl_Ui/js/model/checkout/storage'
], function (_, ko, storage) {
    'use strict';

    /**
     * @callback DhlServiceSelectionObservable
     * @param {*[][]} [value]
     * @return {*[][]}
     */

    /**
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
         * @param {string} name
         * @param {string} [code]
         * @return {*|undefined} Service input value(s) or null if service not found
         */
        getServiceValue: function (name, code) {
            if (name in services()) {
                var service = services()[name];
                if (!code) {
                    return service;
                }
                if (code in service) {
                    return service[code]
                }
            }

            return null;
        },

        /**
         * @param {string} name
         * @param {string} code
         * @param {*} value
         */
        addService: function (name, code, value) {
            var workingCopy = services();
            if (workingCopy[name] == undefined) {
                workingCopy[name] = {};
            }
            workingCopy[name][code] = value;
            storage.set('cachedServiceValues', workingCopy);
            services(workingCopy);
        },

        /**
         * @param {string} name
         * @param {string} code
         */
        removeService: function (name, code) {
            var workingCopy = services();
            delete workingCopy[name][code];
            if (_.isEmpty(workingCopy[name])) {
                delete workingCopy[name];
            }
            storage.set('cachedServiceValues', workingCopy);
            services(workingCopy);
        }
    };
});