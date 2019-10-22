define([
    "uiElement"
], function (Component) {
    'use strict';

    return Component.extend({
        defaults: {
            location: {}
        },

        initialize: function () {
            this._super();
        },

        handleLocationSelect: function (event) {
            console.log(event);
        }
    });
});
