define([
    'underscore',
    'Magento_Ui/js/form/element/checkbox-set'
], function (_, CheckboxSet) {
    'use strict';

    /**
     * A custom subclass for checkbox-set with additional features.
     *
     * - options property is now observable and mutable
     */
    return CheckboxSet.extend({
        defaults: {
            listens: {
                options: 'handleOptionChange'
            }
        },
        initObservable: function () {
            return this._super()
                       .observe('options');
        },

        handleOptionChange: function () {
            let newValues = [];

            this.options().forEach(function (option) {
                newValues.push(option.value);
            });

            this.setInitialValue(_.intersection(newValues, this.initialValue));
            this.value(_.intersection(newValues, this.value()));
            console.log('handling Options change');
            console.log(newValues);
        }
    });
});
