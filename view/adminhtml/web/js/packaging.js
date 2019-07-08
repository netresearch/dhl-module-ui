define([
        "uiComponent", "jquery", "mage/mage", "Magento_Ui/js/modal/modal"
    ], function (Component, $, mage) {
        return Component.extend({
            defaults: {
                target: '',
                modal: false,
                options: {}
            },
            initialize: function () {
                this.window   = $('#packaging-window');
                this.messages = this.window.find('.message-warning')[0];

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
                this.modal.on('modalopened', function () {
                    this.header = $('#dhl-package-buttons'),
                        this.container = this.header.parent().parent().parent().parent();

                    this.container.on('scroll', function () {
                        console.log(this.offsetTop);

                        if (this.offsetTop > 80) {
                            this.header.addClass('fixed');
                        }
                    });

                });

            }
        });
    }
);
