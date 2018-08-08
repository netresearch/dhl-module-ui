define([
    'ko'
], function (ko) {
    'use strict';

    /**
     * @type {Observable}
     */
    let data = ko.observable();

    /**
     * @type {Observable}
     */
    let readyForSubmit = ko.observable(false);

    /**
     * Manage the currently selected packaging popup package item order ids
     */
    return {
        /**
         * @return {Observable}
         */
        get: function () {
            return data;
        },

        /**
         * @param {*} data
         */
        set: function (data) {
            data(data);
        },

        /**
         * @return {Observable}
         */
        isReadyForSubmit: function () {
            return readyForSubmit;
        },

        /**
         * @param {bool} value
         */
        setReadyForSubmit: function (value) {
            readyForSubmit(value);
        },
    }
});
