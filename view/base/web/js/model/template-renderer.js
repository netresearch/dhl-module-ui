/**
 * See LICENSE.md for license details.
 */
define([
    'mage/utils/template'
], function (template) {
    'use strict';

    /**
     * Wraps the html in a <div> to ensure a single HTMLElement is returned.
     *
     * @private
     * @param {string} html
     * @return {HTMLElement}
     */
    var convertToDomElement = function (html) {
        var element = document.createElement('div');

        element.innerHTML = html;

        return element;
    };

    return {
        /**
         * @param {*} config
         * @param {string} html     template html.
         */
        render: function (config, html) {
            return convertToDomElement(
                template.template(html, config)
            );
        }
    };
});
