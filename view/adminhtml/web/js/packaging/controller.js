define([
    "ko",
    'underscore',
    "uiCollection",
    'Dhl_Ui/js/packaging/model/package-state',
    'Dhl_Ui/js/model/shipping-option/selections',
    'uiLayout',
    'mageUtils',
    'mage/translate',
    'Dhl_Ui/js/packaging/model/shipment-data',
    'Dhl_Ui/js/packaging/action/submit',
], function (ko, _, Component, packageState, selections, layout, utils, $t, shipmentData, submit) {
    var self;
    return Component.extend({
        defaults: {
            template: 'Dhl_Ui/packaging/control',
            items: [],
            itemOptions: [],
            packageOptions: [],
            serviceOptions: [],
            submitUrl: ''
        },
        fieldsetTemplate: {
            component: 'Dhl_Ui/js/packaging/view/fieldset',
            label: '${ $.$data.label }',
            name: '${ $.$data.name }',
            parent: '${ $.$data.parent }',
            additionalClasses: 'dhl-fieldset ${ $.$data.name }',
            config: {
                shippingOptions: [],
                activeFieldset: ''
            }
        },

        packages: packageState.packages,
        currentPackage: packageState.currentPackage,
        allItemsPackaged: packageState.allItemsPackaged,

        initialize: function () {
            self = this;
            self._super();
            shipmentData.setItems(this.items);
            self.initChildComponents();
            return self;
        },

        initChildComponents: function () {
            self._super();
            self.reset();
        },

        reset: function () {
            self.destroyChildren();

            var fieldsets = [
                self.generateItemSelectionFieldset(),
                self.generateFieldset('package', $t('Package Options'), self.packageOptions),
                self.generateFieldset('service', $t('Service Options'), self.serviceOptions)
            ];
            layout(fieldsets);
        },

        generateItemSelectionFieldset: function () {
            var baseFieldset = self.generateFieldset('item', $t('Package Items'), self.itemOptions);
            baseFieldset.items = self.items;
            baseFieldset.component = 'Dhl_Ui/js/packaging/view/item-controller';
            return baseFieldset;
        },

        generateFieldset: function (name, label, options) {
            var fieldset = utils.template(self.fieldsetTemplate, {
                name: name,
                label: label,
                parent: self.name,
            });
            fieldset.config = {
                shippingOptions: options,
                itemId: false
            };
            return fieldset;
        },

        selectPackage: function (package) {
            if (package.id !== packageState.currentPackage()) {
                packageState.switchPackage(package.id);
                self.reset();
                self.elems.extend({rateLimit: {timeout: 50, method: "notifyWhenChangesStop"}});
            }
        },

        submitPackages: function () {
            var data = selections.getAll();

            submit(this.submitUrl, data)
                .done(function (response) {
                    if (response.error) {
                        window.packaging.messages.show().innerHTML = response.message;
                    } else {
                        // @TODO add success handling
                        // See vendor/magento/module-shipping/view/adminhtml/web/order/packaging.js
                    }
                });
        },

        newPackage: function () {
            if (packageState.allItemsPackaged() === false) {
                packageState.newPackage();
                self.reset();
                self.elems.extend({rateLimit: {timeout: 50, method: "notifyWhenChangesStop"}});
            }
        },


        deletePackage: function (package) {
            if (packageState.packages().length > 1) {
                var id = packageState.deletePackage(package);
                self.selectPackage({id: id});
            }
        },

        getStateClass: function (package) {
            if (package.id === packageState.currentPackage()) {
                return 'ui-corner-top ui-tabs-active ui-state-default tab-active';
            }
            return 'ui-corner-top ui-state-default'
        }
    });
});
