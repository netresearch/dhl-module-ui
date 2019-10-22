/**
 * See LICENSE.md for license details.
 */
define([
    'underscore',
    'mage/translate',
    'leaflet'
], function (_, $t, leaflet) {
    'use strict';

    var map,
        mapLocations = [],
        iconImages = [],
        icons = [],
        mapUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibXVoYW1tYWQtcWFzaW0iLCJhIjoiY2swdzZibjFuMDEwejNjbmJtNTBxNGxuOSJ9.2x0s6jiqfuKlyNNqCDXkGw',
        accessToken = 'pk.eyJ1IjoibXVoYW1tYWQtcWFzaW0iLCJhIjoiY2swdzZibjFuMDEwejNjbmJtNTBxNGxuOSJ9.2x0s6jiqfuKlyNNqCDXkGw',
        attribution = $t('Map data') + ' &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>';

    var isLoaded = function () {
        return map.hasOwnProperty('_loaded') && map._loaded === true;
    };

    /**
     * Create a Marker for each location, add it to the map and set the marker to the location.
     *
     * @param {MapLocation[]} locations - new locations fetched from web service.
     */
    var addMarkers = function (locations) {
        var centered = false;

        // remove current markers from map
        _.each(mapLocations, function (index) {
            if (mapLocations[index].marker instanceof leaflet.Marker) {
                mapLocations[index].marker.removeFrom(map);
            }
        });

        // reset locations
        mapLocations = [];

        //todo(nr): group locations by type, add them to the same leaflet.FeatureGroup

        // add new locations to map
        _.each(locations, function (index) {
            var marker = leaflet.marker([locations[index].latitude, locations[index].longitude]),
                locationType = locations[index].type,
                popup = leaflet.popup({className: 'location-popup-' + locations[index].id});


            if (!centered) {
                map.setView([locations[index].latitude, locations[index].longitude], 15);
                centered = true;
            }

            if (typeof iconImages[locationType] !== 'undefined') {
                if (typeof icons[locationType] === 'undefined') {
                    icons[locationType] = leaflet.icon({
                        iconUrl: iconImages[locationType],
                        popupAnchor: [23, 0]
                    });
                }
                marker.setIcon(icons[locationType]);
            }

            popup.setContent(locations[index].getInfoText());
            marker.bindPopup(popup);

            marker.on('popupclose', function (event) {
                //todo: do not use popupclose event for selecting a location, event callback must be set from outside
                //todo: add data- attributes to popup markup, find popup via class attribute, read data- attributes
                //document.getElementById('dhlgw-selected-location').innerText = event.popup.options['className'];
            });
            marker.addTo(map);

            locations[index].setMarker(marker);

            mapLocations.push(locations[index]);
        });
    };

    /**
     * Initialize map at the given element with given coordinates and zoom.
     *
     * @param {string} elmId
     * @param {number} lat
     * @param {number} lng
     * @param {number} zoom
     * @param {string[]} images
     */
    var init = function (elmId, lat, lng, zoom, images) {

        if (map) {
            map.remove();
        }
        iconImages = images;
        map = leaflet.map(elmId).setView([lat, lng], zoom);

        leaflet.tileLayer(mapUrl, {
            attribution: attribution,
            maxZoom: 18,
            id: 'mapbox.streets',
            accessToken: accessToken
        }).addTo(map);

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
                    _.each(mapLocations, function (index) {
                        if (mapLocations[index].marker instanceof leaflet.Marker) {
                            mapLocations[index].marker.setOpacity(Number(event.target.checked));
                        }
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
    };

    return {

        /**
         * Initialize map at the given element with given coordinates and zoom.
         *
         * @function
         * @param {string} elmId
         * @param {number} lat
         * @param {number} lng
         * @param {number} zoom
         * @param {string[]} images
         */
        init: init,

        /**
         * Update the map contents to display locations close to the given address.
         *
         * @param {string} countryCode
         * @param {string} postalCode
         * @param {string} city
         * @param {string} street
         */
        updateLocations: function (countryCode, postalCode, city, street) {
            if (isLoaded()) {
                //findLocations(countryCode, postalCode, city, street, addMarkers);
            }
        }
    };
});
