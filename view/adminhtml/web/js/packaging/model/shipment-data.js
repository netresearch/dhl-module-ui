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
    let readyForReset = ko.observable(false);
    /**
     * @type {Observable}
     */
    let readyForSubmit = ko.observable(true);

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
        isReadyForReset: function () {
            return readyForReset;
        },

        /**
         * @param {boolean} value
         */
        setReadyForReset: function (value) {
            readyForReset(value);
        },

        /**
         * @return {Observable}
         */
        isReadyForSubmit: function () {
            return readyForSubmit;
        },

        /**
         * @param {boolean} value
         */
        setReadyForSubmit: function (value) {
            readyForSubmit(value);
        },
    }
});
