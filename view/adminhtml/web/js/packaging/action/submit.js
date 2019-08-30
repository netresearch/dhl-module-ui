define([
    'jquery',
    'mage/storage'
], function ($, storage) {
    'use strict';

    return function (submitUrl, data) {
        $('body').trigger('processStart');
        return storage.post(
            submitUrl,
            {
                data: JSON.stringify(data)
            },
            true,
            'application/x-www-form-urlencoded'
        ).fail(function () {
            $('body').trigger('processStop');
        });
    };
});
