/**
 * See LICENSE.md for license details.
 */
define([
    'underscore',
    'leaflet',
    'Dhl_Ui/js/model/template-renderer',
    'text!Dhl_Ui/template/location/filter.html',
    'uiRegistry'
], function (_,leaflet, tmplRenderer, filterHtml) {
    'use strict';

    /**
     * @param {HTMLElement} element
     * @param {MarkerGroup} group
     */
    var handleControlClick = function (element, group) {
        _.each(group.markers, function (marker) {
            marker.setOpacity(Number(element.checked));
        });
    };

    return {
        /**
         * Add checkbox control for filtering markers to map.
         *
         * @param {MarkerGroup} group
         * @param {leaflet.Map} map
         */
        createGroupFilterControl: function (group, map) {
            leaflet.Control.TypeSelector = leaflet.Control.extend({
                onAdd: function () {
                    var element = tmplRenderer.render({
                        iconUrl: group.iconUrl,
                        iconSize: '40px',
                        type: group.type
                    }, filterHtml);

                    element.addEventListener('click', function (event) {
                        handleControlClick(event.target, group);
                    });

                    return element;
                }
            });

            return new leaflet.Control.TypeSelector({position: 'topright'}).addTo(map);
        }
    };
});
