define([], function () {
    'use strict';

    /**
     * @type {[{id: integer, qty: float|integer}]}
     */
    var items = [];

    return {
        /**
         * @param {[{id: integer, qty: float|integer}]} newItems
         */
        setItems: function (newItems) {
            items = newItems;
        },

        /**
         * @param {[{id: integer, qty: float|integer}]|{id: integer, qty: float|integer, productName: string}}newItems
         */
        addItems: function (newItems) {
            items.push(newItems);
        },

        /**
         * @returns {{id: integer, qty: (float|integer)}[]}
         */
        getItems: function () {
            return items;
        }
    }
});
