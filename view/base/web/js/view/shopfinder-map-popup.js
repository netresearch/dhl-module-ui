define([
    "uiElement",
    "uiRegistry"
], function (Component, registry) {
    'use strict';

    return Component.extend({
        defaults: {
            location: null
        },

        handleLocationSelect: function () {
            registry.get({component:'Dhl_Ui/js/view/input/shopfinder'}, function (shopfinder) {
                shopfinder.selectLocation(this.location);
            }.bind(this));
        }
    });
});
