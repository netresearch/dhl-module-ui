define([
    'Dhl_Ui/js/packaging/model/shipment-data'
], function (shipmentData) {
    return function (selections) {
        var availableItems = [];

        shipmentData.getItems().each(function (item) {
            var qtyPacked = selections.reduce(function (carry, selection) {
                return carry + selection['items'][item.id]['details']['qty'];
            }, 0);
            var qtyToShip = selections[0]['items'][item.id]['details']['qtyToShip'];
            if (qtyPacked < qtyToShip) {
                availableItems.push({id: item.id, qty: qtyToShip - qtyPacked})
            }
        });
        return availableItems;
    }
});
