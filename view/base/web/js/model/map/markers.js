/**
 * See LICENSE.md for license details.
 */
define([
    'knockout',
    'jquery',
    'leaflet',
    'Dhl_Ui/js/model/template-renderer',
    'text!Dhl_Ui/template/location/popup.html',
    'uiRegistry'
], function (ko, $, leaflet, tmplRenderer, popupHtml, registry) {
    'use strict';

    /**
     * Let location popup template be parsed by Magento
     * to init component.
     *
     * @param {DhlLocation} location
     * @param {leaflet.Popup} popup
     */
    var initTemplateBindings = function (location, popup) {
        var containerId = 'map-popup-container-' + location.shop_id,
            componentName = 'shopfinder-map-popup-' + location.shop_id;

        // parse x-magento-init script
        $(document.getElementById(containerId)).trigger('contentUpdated');
        registry.get(componentName, function (component) {
            // apply ko bindings on template
            var element = document.getElementById(containerId);

            try {
                ko.applyBindings(component, element);
                popup.update();
            } catch (e) {
                // if the binding is already applied everything is fine.
                popup.update();
            }
        });
    };

    return {
        /**
         * Popups are initialized as custom JavaScript components
         * with full knockout.js functionality.
         *
         * @param {DhlLocation} location
         * @return {leaflet.Marker}
         */
        createPopupMarker: function (location) {
            var marker = leaflet.marker(leaflet.latLng(
                location.latitude,
                location.longitude
            ));

            if (location.icon) {
                marker.setIcon(
                    leaflet.icon({
                        iconUrl: location.icon,
                        iconAnchor: [23, 23]
                    })
                );
            }

            marker.bindPopup(
                leaflet.popup({
                    minWidth: 200
                }).setContent(tmplRenderer.render(
                    {location: location},
                    popupHtml
                ))
            );

            marker.on('popupopen', function (event) {
                initTemplateBindings(location, event.popup);
            });

            return marker;
        }
    };
});
