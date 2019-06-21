define([
    'mage/storage'
], function (storage) {
    'use strict';

    return function (submitUrl, data) {
        return storage.post(
            submitUrl,
            {
                data: JSON.stringify(data)
            },
            true,
            'application/x-www-form-urlencoded'
        );
    }
});
