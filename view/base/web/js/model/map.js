/**
 * See LICENSE.md for license details.
 */
define([
    'underscore',
    'mage/translate',
    'leaflet',
    'Dhl_Ui/js/model/map-config',
    'Dhl_Ui/js/model/map/markers',
    'Dhl_Ui/js/model/map/controls'
], function (_, $t, leaflet, mapConfig, markers, controls) {
    'use strict';

    /**
     * @typedef {{
     *     type: string,
     *     iconUrl: string,
     *     markers: leaflet.Marker[],
     *     control: leaflet.Control|null
     * }} MarkerGroup
     */

    /**
     * @param {Object.<string, MarkerGroup>} markerGroups
     **/
    var markerGroups = {};

    /**
     * @type {leaflet.Map|null}
     */
    var map = null;

    /**
     * @type {string}
     */
    var accessToken = mapConfig.getToken();

    /**
     * @type {string}
     */
    var mapUrl = mapConfig.getUrl();

    /**
     * @type {string}
     */
    var attribution = $t('Map data') + ' &copy; ' + mapConfig.getAttribution();

    return {
        /**
         * Initialize map at the given element with given coordinates and zoom.
         *
         * @param {string} elementId
         * @param {number} lat
         * @param {number} lng
         * @param {number} zoom
         * @param {function} errorHandler
         */
        init: function (elementId, lat, lng, zoom, errorHandler) {
            var tile;

            if (map) {
                map.remove();
            }

            map = leaflet.map(elementId).setView([lat, lng], zoom);

            tile = leaflet.tileLayer(mapUrl, {
                attribution: attribution,
                maxZoom: 18,
                id: 'mapbox.streets',
                accessToken: accessToken
            });
            tile.on('tileerror', function () {
                var message = $t('An error occurred while loading map. Please try again later.');

                errorHandler(message);
            });
            tile.addTo(map);
        },

        /**
         * Create a Marker for each location, add it to the map and add a popup for each location.
         * The map is centered on the added locations.
         *
         * @public
         * @param {DhlLocation[]} locations - new locations fetched from web service.
         */
        setLocations: function (locations) {
            // center map on first location
            if (locations[0]) {
                map.setView([
                    locations[0].latitude,
                    locations[0].longitude
                ], 15);
            }

            markerGroups = this.regenerateMarkerGroups(markerGroups, locations);

            // add new locations to map
            _.each(locations, /** @param {DhlLocation} location */ function (location) {
                var marker = markers.createPopupMarker(location);

                marker.addTo(map);
                markerGroups[location.shop_type].markers.push(marker);
            });

            // add marker filter controls
            _.each(markerGroups, /** @param {MarkerGroup} group */ function (group) {
                group.control = controls.createGroupFilterControl(group, map);
            });
        },

        /**
         * Remove all controls and markers,
         * regenerate marker groups from locations
         *
         * @private
         * @param {Object.<string, MarkerGroup>} oldMarkerGroups
         * @param {DhlLocation[]} locations
         * @return {Object.<string, MarkerGroup>}
         */
        regenerateMarkerGroups: function (oldMarkerGroups, locations) {
            var groups = {};

            // remove old markers and controls from map
            _.each(oldMarkerGroups, function (group) {
                map.removeControl(group.control);
                _.each(group.markers, function (marker) {
                    map.removeLayer(marker);
                });
            });

            // create new marker groups
            _.each(locations, /** @param {DhlLocation} location */ function (location) {
                if (location.icon && _.keys(groups).indexOf(location.shop_type) === -1) {
                    groups[location.shop_type] = {
                        type: location.shop_type,
                        iconUrl: location.icon,
                        control: null,
                        markers: []
                    };
                }
            });

            return groups;
        }
    };
});
