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
    "Dhl_Ui/js/action/shipping-option/validation/validate-selection"
], function (ko, _, Component, packageState, selections, layout, utils, $t, shipmentData, submit, validate) {
    'use strict';

    var self;
    return Component.extend({
        defaults: {
            template: 'Dhl_Ui/packaging/control',
            items: [],
            itemOptions: [],
            packageOptions: [],
            serviceOptions: [],
            submitUrl: '',
            successRedirect: '',
            image: ''
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
            window.packaging.open.subscribe(self.popupStateChanged.bind(self));
            self.initChildComponents();
            return self;
        },

        initShipmentItems: function () {
            var itemSelection = Array.from(document.querySelectorAll('#ship_items_container input.qty-item'))
                .map((item) => {
                    return {id: item.name.replace(/[^0-9]+/g, ''), qty: item.value}
                });
            shipmentData.setItems(self.items.map((item) => _.extend(item, itemSelection.find((selected) => Number(selected.id) === Number(item.id)))));
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
            ];
            if (self.serviceOptions.length > 0) {
                fieldsets.push(self.generateFieldset('service', $t('Service Options'), self.serviceOptions));
            }
            layout(fieldsets);
            self.elems.extend({rateLimit: {timeout: 50, method: "notifyWhenChangesStop"}});
        },

        generateItemSelectionFieldset: function () {
            var baseFieldset = self.generateFieldset('items', $t('Package Items'), self.itemOptions);
            baseFieldset.config.opened = false;
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
                itemId: false,
                collapsible: true,
                opened: true
            };
            return fieldset;
        },

        selectPackage: function (selectedPackage) {
            if (selectedPackage.id !== packageState.currentPackage()) {
                packageState.switchPackage(selectedPackage.id);
                self.reset();
            }
        },

        submitPackages: function () {
            var data = selections.getAll();
            if (validate()) {
                submit(this.submitUrl, data)
                    .done(function (response) {
                        if (response.error) {
                            window.packaging.messages.show().innerHTML = response.message;
                        } else if (response.ok) {
                            window.location.href = self.successRedirect;
                        }
                    });
            }
        },

        newPackage: function () {
            if (packageState.allItemsPackaged() === false) {
                packageState.newPackage();
                self.reset();
            }
        },

        deletePackage: function (packageToDelete) {
            if (packageState.packages().length > 1) {
                var id = packageState.deletePackage(packageToDelete);
                self.selectPackage({id: id});
            }
        },

        getStateClass: function (packageModel) {
            if (packageModel.id === packageState.currentPackage()) {
                return 'ui-corner-top ui-tabs-active ui-state-default tab-active';
            }
            return 'ui-corner-top ui-state-default'
        },

        /**
         * Handle opening and closing the popup
         * @param popupOpen
         */
        popupStateChanged: function (popupOpen) {
            if (popupOpen) {
                /**
                 * If opened, reinitialize rendering and create a new package with all available items
                 */
                self.initShipmentItems();
                packageState.newPackage();
                self.reset();
            } else {
                /**
                 * If closed, remove all previous data selections, as qtys of the items to ship can change
                 */
                packageState.reset();
                selections.reset();
            }
        }
    });
});
