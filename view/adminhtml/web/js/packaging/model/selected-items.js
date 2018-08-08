define([
    'ko'
], function (ko) {
    'use strict';

    let selectedItems = ko.observableArray([]);

    /**
     * Manage the currently selected packaging popup package item order ids
     */
    return {
        /**
         * @return {ObservableArray}
         */
        get: function () {
            return selectedItems;
        },

        /**
         * @param {int[]} items
         */
        set: function (items) {
            selectedItems(items);
        }
    }
});
