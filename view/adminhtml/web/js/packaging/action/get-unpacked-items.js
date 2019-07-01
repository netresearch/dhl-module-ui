define([
    'Dhl_Ui/js/packaging/model/shipment-data'
], function (shipmentData) {
    /**
     * Reads through the given selections to find items that are not yet packaged
     *
     * @param selections {[{items: Object, packageId: int}]}
     * @param withUnavailable {boolean|true}
     */
    return function (selections, withUnavailable) {
        var availableItems = [];

        shipmentData.getItems().each(function (item) {
            var qtyPacked = selections.reduce(function (carry, selection) {
                return carry + selection['items'][item.id]['details']['qty'];
            }, 0);
            var qtyToShip = selections[0]['items'][item.id]['details']['qtyToShip'];
            if (qtyPacked < qtyToShip || withUnavailable === true) {
                availableItems.push({id: item.id, qty: qtyToShip - qtyPacked})
            }
        });
        return availableItems;
    }
});
