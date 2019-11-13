define([
    'underscore',
    'uiCollection',
    'Dhl_Ui/js/model/shipping-settings',
    'Dhl_Ui/js/packaging/model/package-state',
    'Dhl_Ui/js/model/shipping-option/selections',
    'uiLayout',
    'mageUtils',
    'mage/translate',
    'Dhl_Ui/js/packaging/model/shipment-data',
    'Dhl_Ui/js/packaging/action/submit',
    'Dhl_Ui/js/action/shipping-option/validation/validate-selection',
    'Dhl_Ui/js/action/shipping-option/validation/validate-compatibility',
    'Dhl_Ui/js/action/shipping-option/validation/enforce-compatibility',
    'Dhl_Ui/js/packaging/model/item-quantity',
    'Dhl_Ui/js/packaging/model/item-combination-rules',
    'Dhl_Ui/js/packaging/model/value-maps',
], function (
    _,
    Component,
    shippingSettings,
    packageState,
    selections,
    layout,
    utils,
    $t,
    shipmentData,
    submit,
    validateSelection,
    validateCompatibility,
    enforceCompatibility,
    itemQuantity,
    itemCombinationRules,
    valueMaps
) {
    'use strict';

    var self;

    /** @property {DhlShippingSettings} shippingSettings **/

    return Component.extend({
        defaults: {
            template: 'Dhl_Ui/packaging/control',
            items: [],
            errors: [],
            submitUrl: '',
            successRedirect: '',
            shippingSettingsController: true,
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
        disableAddPackage: packageState.allItemsPackaged,
        disableSave: function () {
            /** Using a computed observable to invert the value of allItemsPackaged */
            return !packageState.allItemsPackaged();
        },

        initialize: function () {
            self = this;
            self._super();
            shippingSettings.set(self.shippingSettings);
            window.packaging.open.subscribe(self.popupStateChanged.bind(self));
            self.initChildComponents();

            return self;
        },

        initObservable: function () {
            self._super();
            self.observe('errors');
            self.elems.extend({rateLimit: {timeout: 50, method: 'notifyWhenChangesStop'}});

            return self;
        },

        /**
         * Extract the requested item quantities from the new shipment page DOM
         * and create shipment items in the packaging popup.
         */
        initShipmentItems: function () {
            var itemQtyInputs = Array.from(
                document.querySelectorAll('#ship_items_container .col-qty > input')
            );
            var itemSelection = itemQtyInputs.map(function (item) {
                return {id: item.name.replace(/[^0-9]+/g, ''), qty: item.value};
            });

            shipmentData.setItems(self.items.map(function (item) {
                return _.extend(item, itemSelection.find(function (selected) {
                    return Number(selected.id) === Number(item.id);
                }));
            }));
        },

        initChildComponents: function () {
            self._super();
            self.reset();
        },

        reset: function () {
            self.destroyChildren();

            var fieldsets = [
                self.generateItemSelectionFieldset(),
                self.generateFieldset(
                    'package',
                    $t('Package Options'),
                    self.shippingSettings.carriers[0].package_options
                ),
            ];
            if (self.shippingSettings.carriers[0].service_options.length > 0) {
                fieldsets.push(self.generateFieldset(
                    'service',
                    $t('Service Options'),
                    self.shippingSettings.carriers[0].service_options
                ));
            }
            layout(fieldsets);


            /**
             * When selections change:
             * 1. Keep item qty options updated
             * 2. Apply item combination rules
             */
            selections.get().subscribe(
                /** @param {DhlCurrentSelection} selectionObject **/ function (selectionObject) {
                    if (selectionObject) {
                        valueMaps.apply(
                            self.shippingSettings.carriers[0].package_options,
                            'package'
                        );
                        itemQuantity(selectionObject);

                        itemCombinationRules.apply(
                            selections.getCurrentItems()(),
                            self.shippingSettings.carriers[0].package_options
                        );
                    }
                }
            );
        },

        generateItemSelectionFieldset: function () {
            var baseFieldset = self.generateFieldset(
                'items',
                $t('Package Items'),
                self.shippingSettings.carriers[0].item_options
            );

            baseFieldset.config.opened = true;
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

            if (!packageState.allItemsPackaged()) {
                window.packaging.messages.show().innerHTML =
                    $t('Some items are not assigned to a package. Please assign every item to a package.');
                return;
            }

            if (validateSelection() && validateCompatibility()) {
                submit(self.submitUrl, data)
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
            var packageToSwitchTo;

            if (packageState.packages().length > 1) {
                packageToSwitchTo = packageState.deletePackage(packageToDelete);

                /*
                 * Do not call self.selectPackage() since we want to reset
                 * even if we are already on the packageToSwitchTo.
                 */
                packageState.switchPackage(packageToSwitchTo);
                self.reset();
            }
        },

        getStateClass: function (packageModel) {
            if (packageModel.id === packageState.currentPackage()) {
                return 'ui-corner-top ui-tabs-active ui-state-default tab-active';
            }

            return 'ui-corner-top ui-state-default';
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
        },

        /**
         * @param {{id: string}} parcel
         * @return {string}
         */
        getPackageTitle: function (parcel) {
            return $t('Package %1').replace('%1', parcel.id);
        },

        /**
         * @return {string}
         */
        getImage: function () {
            return self.shippingSettings.carriers[0].metadata.image_url;
        },

        /**
         * @return {boolean}
         */
        hasImage: function () {
            return Boolean(self.shippingSettings.carriers[0].metadata.image_url);
        }
    });
});
