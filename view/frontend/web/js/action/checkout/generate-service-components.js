define([
    'underscore',
    'uiLayout',
], function (_, layout) {
    'use strict';

    /**
     * @var {object[]} services
     * @var {string} parentName
     */
    return function (services, parentName) {
        var servicesLayout = _.map(services, function (service) {
            return {
                parent: parentName,
                component: 'Dhl_Ui/js/view/checkout/service',
                service: service,
            };
        }, this);

        layout(servicesLayout);
    }
});
