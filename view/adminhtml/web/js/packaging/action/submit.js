define([
    'mage/storage'
], function (storage) {
    'use strict';

    return function (data) {
        return storage.post(
            'dhl/order_shipment/save',
            JSON.stringify(data),
            true
        ).done();
    }
});
