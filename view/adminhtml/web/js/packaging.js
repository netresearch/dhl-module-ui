define([
        "uiComponent", "jquery", "Magento_Ui/js/modal/modal"
    ], function (Component, $) {
        return Component.extend({
            defaults: {
                target: '',
                modal: false,
                options: {}
            },
            initialize: function () {
                this._super();
                this.modal = $(this.target);
                this.initModal();
            },
            initModal: function () {
                this.modal.modal(this.options);
                /**
                 * Override the global packaging object with this one.
                 */
                window.packaging = this;
            },
            /**
             * Fake the core packaging::showWindow method to display our modal.
             */
            showWindow: function () {
                this.modal.modal('openModal');
            }
        });
    }
);
