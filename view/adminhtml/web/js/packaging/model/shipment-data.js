define([], function () {
    'use strict';

    /**
     * @type {{id: Number, qty: Number}[]}
     */
    var items = [];

    return {
        /**
         * @param {{id: Number, qty: Number}[]} newItems
         */
        setItems: function (newItems) {
            items = newItems;
        },

        /**
         * @returns {{id: Number, qty: Number}[]}
         */
        getItems: function () {
            return items;
        }
    };
});
