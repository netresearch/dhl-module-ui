/**
 * See LICENSE.md for license details.
 */
define([
    'underscore',
    'knockout',
    'jquery',
    'mage/translate',
    'leaflet',
    'Dhl_Ui/js/model/map-location-renderer',
    'uiRegistry'
], function (_, ko, $, $t, leaflet, mapLocationRenderer, registry) {
    'use strict';

    var map,
        markers = [],
        mapUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibXVoYW1tYWQtcWFzaW0iLCJhIjoiY2swdzZibjFuMDEwejNjbmJtNTBxNGxuOSJ9.2x0s6jiqfuKlyNNqCDXkGw',
        accessToken = 'pk.eyJ1IjoibXVoYW1tYWQtcWFzaW0iLCJhIjoiY2swdzZibjFuMDEwejNjbmJtNTBxNGxuOSJ9.2x0s6jiqfuKlyNNqCDXkGw',
        attribution = $t('Map data') + ' &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>';

    return {
        /**
         * Initialize map at the given element with given coordinates and zoom.
         *
         * @function
         * @param {string} elementId
         * @param {number} lat
         * @param {number} lng
         * @param {number} zoom
         */
        init: function (elementId, lat, lng, zoom) {

            if (map) {
                map.remove();
            }

            // Initialize map
            map = leaflet.map(elementId).setView([lat, lng], zoom);
            leaflet.tileLayer(mapUrl, {
                attribution: attribution,
                maxZoom: 18,
                id: 'mapbox.streets',
                accessToken: accessToken
            }).addTo(map);

            // Add "show locations" checkbox
            leaflet.Control.TypeSelector = leaflet.Control.extend({
                onAdd: function () {
                    var label = leaflet.DomUtil.create('label'),
                        labelText = leaflet.DomUtil.create('span'),
                        checkbox = leaflet.DomUtil.create('input'),
                        div = leaflet.DomUtil.create('div'),
                        form = leaflet.DomUtil.create('form');

                    labelText.innerText = $t('Display locations');

                    checkbox.setAttribute('id', 'location-toggle');
                    checkbox.setAttribute('type', 'checkbox');
                    checkbox.checked = 'checked';
                    checkbox.addEventListener('click', function (event) {
                        _.each(markers, function (marker) {
                            marker.setOpacity(Number(event.target.checked));
                        });
                    });

                    label.appendChild(checkbox);
                    label.appendChild(labelText);
                    form.insertAdjacentElement('afterbegin', label);
                    div.insertAdjacentElement('afterbegin', form);

                    return div;
                }
            });
            new leaflet.Control.TypeSelector({position: 'topright'}).addTo(map);
        },

        /**
         * Create a Marker for each location, add it to the map and add a popup for each location.
         * The map is centered on the added locations.
         * Popups are initialized as custom JavaScript components with full knockout functionality.
         *
         * @function
         * @param {DhlLocation[]} locations - new locations fetched from web service.
         */
        setLocations: function (locations) {
            // remove current markers from map
            _.each(markers, function (marker) {
                marker.removeFrom(map);
            });
            markers = [];

            // center map on first location
            if (locations[0]) {
                map.setView([
                    locations[0].latitude,
                    locations[0].longitude
                ], 15);
            }

            // add new locations to map
            _.each(locations, /** @param {DhlLocation} location */ function (location) {
                var marker = leaflet.marker(leaflet.latLng(
                    location.latitude,
                    location.longitude
                ));
                var popup = leaflet.popup({
                    className: 'location-popup-' + location.shop_id,
                    minWidth: 200
                });

                if (location.icon) {
                    marker.setIcon(
                        leaflet.icon({
                            iconUrl: location.icon,
                            iconAnchor: [23, 23],
                        })
                    );
                }

                marker.bindPopup(popup);
                marker.setPopupContent(mapLocationRenderer.render(location));
                marker.on('popupopen', function () {
                    var containerId = 'map-popup-container-' + location.shop_id,
                        componentName = 'shopfinder-map-popup-' + location.shop_id;

                    // parse x-magento-init script
                    $(document.getElementById(containerId)).trigger('contentUpdated');
                    registry.get(componentName, function (component) {
                        // apply ko bindings on template
                        ko.applyBindings(
                            component,
                            document.getElementById(containerId)
                        );
                    });
                });
                marker.addTo(map);
                markers.push(marker);
            });
        }
    };
});
