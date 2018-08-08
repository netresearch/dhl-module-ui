define([
    'ko'
], function (ko) {
    'use strict';

    let activeFieldsetName = ko.observable('');

    /**
     * Manage the currently active packaging popup fieldset
     */
    return {
        get: function () {
            return activeFieldsetName;
        },

        set: function (name) {
            activeFieldsetName(name);
        }
    }
});
