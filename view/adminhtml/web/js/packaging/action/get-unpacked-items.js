define([
    'Dhl_Ui/js/packaging/model/shipment-data'
], function (shipmentData) {
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
                return carry + Number(selection['items'][item.id]['details']['qty']);
            }, 0);
            var qtyToShip = Number(selections[0]['items'][item.id]['details']['qtyToShip']);
            availableItems.push({id: item.id, qty: qtyToShip - qtyPacked})
        });

        return availableItems;
    }
});
