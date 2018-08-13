define([
    'ko'
], function (ko) {
    'use strict';

    let availableItems = ko.observableArray([]);

    /**
     * Manage the currently still available package items order ids
     *
     * @example
     * [
     *  {
     *    value: '3'
     *    label: 'Item name'
     *  }
     * ]
     */
    return {
        /**
         * @return {ObservableArray}
         */
        get: function () {
            return availableItems;
        },

        /**
         * @return {int[]}
         */
        getIds: function () {
            let ids = [];
            availableItems().forEach(function (item) {
                ids.push(item.value)
            });

            return ids;
        },


        /**
         * @param {int[]} items
         */
        set: function (items) {
            availableItems(items);
        }
    }
});
