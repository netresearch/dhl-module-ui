define([
    'underscore',
    'uiRegistry',
], function (_, registry) {
    'use strict';

    /**
     * Trigger built in form input component validation of service inputs.
     *
     * @return {bool}
     */
    return function () {
        var inputs = registry.filter({isInputComponent: true}),
            result = true;

        _.each(inputs, function (input) {
            var validationResult = input.validate();
            if (typeof validationResult === 'undefined') {
                // fallback for https://github.com/dotmailer/dotmailer-magento2-extension-sms/issues/1
                if (input.error()) {
                    result = false;
                }
            } else if (!validationResult.valid) {
                result = false;
            }
        });

        return result;
    };
});
