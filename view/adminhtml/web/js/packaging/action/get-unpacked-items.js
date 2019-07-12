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
                var itemSelection = selection['items'][item.id];
                return carry + Number(itemSelection ? itemSelection['details']['qty'] : 0);
            }, 0);
            availableItems.push({id: item.id, qty: item.qty - qtyPacked})
        });

        return availableItems;
    }
});
