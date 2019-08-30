define([
    'underscore',
    'Dhl_Ui/js/packaging/model/shipment-data'
], function (_, shipmentData) {
    "use strict";

    /**
     * Reads through the given selections to find items that are not yet packaged
     *
     * @param selections {[{items: Object, packageId: int}]}
     * @param withUnavailable {boolean|true}
     */
    return function (selections) {
        var availableItems = [];

        shipmentData.getItems().each(function (item) {
            var qtyPacked = selections.reduce(function (carry, selection) {
                var itemSelection = selection['items'][item.id];

                return carry + Number(itemSelection ? itemSelection['details']['qty'] : 0);
            }, 0);

            availableItems.push(_.extend({}, item, {qty: item.qty - qtyPacked, qtyToShip: Number(item.qty)}));
        });

        return availableItems;
    };
});
