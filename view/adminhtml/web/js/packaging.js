define([
    "uiComponent",
    "underscore",
    "jquery",
    "Magento_Ui/js/modal/modal"
], function (Component, _, $) {
    'use strict';

    return Component.extend({
        defaults: {
            target: '',
            modal: false,
            options: {},
            open: false,
            carrierCode: ''
        },

        initialize: function () {
            this.window = $('#packaging-window');
            this.messages = this.window.find('.message-warning')[0];

            this._super();
            this.modal = $(this.target);
            this.initModal();
        },

        /**
         * Initialize observables
         *
         * @return {exports}
         */
        initObservable: function () {
            this._super()
                .observe('open');

            return this;
        },

        /**
         * Callback for the modal being closed
         */
        closeModal: function () {
            this.open(false);
        },

        /**
         * Callback for the modal being opened
         */
        openModal: function () {
            this.open(true);
        },

        /**
         * Create modal widget and configure it
         */
        initModal: function () {
            this.modal.modal(_.extend({}, this.options, {
                closed: this.closeModal.bind(this),
                opened: this.openModal.bind(this)
            }));

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
            this.messages = this.window.find('.message-warning')[0];
        }
    });
});
