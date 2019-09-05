define([], function () {
    'use strict';
    /**
     * Generate a numeric hash of the given string, similar to Javas String::hashCode
     *
     * Does not guarantee uniqueness!
     *
     * @param stringToHash
     * @return {number}
     */
    var hashfunc = function (stringToHash) {
        var hash = 0;
        if (stringToHash.length === 0 || typeof stringToHash !== 'string') {
            return hash;
        }
        for (var i = 0; i < stringToHash.length; i++) {
            var char = stringToHash.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }

        return hash;
    };

    return hashfunc;
});
