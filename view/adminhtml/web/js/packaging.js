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
                window.packaging = this;
            },
            showWindow: function () {
                this.modal.modal('openModal');
            }
        });
    }
);
