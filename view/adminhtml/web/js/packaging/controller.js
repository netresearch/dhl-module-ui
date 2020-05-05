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
    'Dhl_Ui/js/packaging/model/item-quantity',
    'Dhl_Ui/js/packaging/model/item-combination-rules',
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
    itemQuantity,
    itemCombinationRules
) {
    'use strict';

    var self;

    /** @property {DhlShippingSettings} shippingSettings **/

    return Component.extend({
        defaults: {
            template: 'Dhl_Ui/packaging/control',
            errors: [],
            submitUrl: '',
            successRedirect: '',
            shippingSettingsController: true,
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
         * Extract the requested item quantities and store them.
         *
         * On the "New Shipment" page, item qtys are dynamic and must
         * be picked from DOM input fields.
         * On the "View Shipment" page, the total qtys are immutable
         * and the DOM does not matter.
         */
        initShipmentItems: function () {
            var qtyMap,
                itemQtyElements = Array.from(
                    document.querySelectorAll('#ship_items_container .col-qty > input')
                );

            if (itemQtyElements.length > 0) {
                /**
                 * Dynamic Qty data from the DOM is more
                 * up-to-date than shipping settings.
                 */
                qtyMap = itemQtyElements.map(function (item) {
                    return {
                        id: Number(item.name.replace(/[^0-9]+/g, '')),
                        qty: Number(item.value)
                    };
                });
            } else {
                /*
                 * If there is no DOM information, fall back
                 * to using data from shipping settings.
                 */
                qtyMap = self.shippingSettings.carriers[0].item_options.map(function (itemOption) {
                    /** @type {DhlInput|undefined} */
                    var qtyInput = _.findWhere(itemOption.shipping_options[0].inputs, {code: 'qty'});

                    return {
                        id: itemOption.item_id,
                        qty: Number(qtyInput ? qtyInput.default_value : 0)
                    };
                });
            }

            shipmentData.setItems(qtyMap);
        },

        initChildComponents: function () {
            self._super();
            self.reset();
        },

        reset: function () {
            var fieldsets;

            self.destroyChildren();
            fieldsets = [
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
             * When selections change, keep item qty options updated
             *
             * Value maps and item combination rules are instead applied directly in
             * js/view/shipping-option-input.js::onUpdate to make sure they
             * are only triggered if appropriate.
             */
            selections.get().subscribe(
                function (selectionObject) {
                    if (selectionObject) {
                        itemQuantity(selectionObject);
                    }
                }
            );
        },

        generateItemSelectionFieldset: function () {
            var fieldset = self.generateFieldset(
                'items',
                $t('Package Items'),
                self.shippingSettings.carriers[0].item_options
            );

            fieldset.opened = true;
            fieldset.component = 'Dhl_Ui/js/packaging/view/item-controller';

            return fieldset;
        },

        generateFieldset: function (name, label, options) {
            return {
                component: 'Dhl_Ui/js/packaging/view/fieldset',
                label: label,
                name: name,
                parent: self.name,
                additionalClasses: 'dhl-fieldset ' + name,
                shippingOptions: options,
                itemId: false,
                collapsible: true,
                opened: true,
                activeFieldset: ''
            };
        },

        selectPackage: function (selectedPackage) {
            if (selectedPackage.id !== packageState.currentPackage()) {
                packageState.switchPackage(selectedPackage.id);
                self.reset();
            }
        },

        submitPackages: function () {
            var data = selections.getAll();

            // remove all items with 0 quantity
            data = data.map(function (selection) {
                selection.items = _.omit(selection.items, function (item) {
                    return Number(item.details.qty) === 0;
                });
                return selection;
            });

            if (!packageState.allItemsPackaged()) {
                self.setErrorMessage(
                    $t('Some items are not assigned to a package. Please assign every item to a package.')
                );
                return;
            }

            if (validateSelection() && validateCompatibility()) {
                submit(self.submitUrl, data)
                    .done(function (response) {
                        if (response.error) {
                            self.setErrorMessage(response.message);
                        } else if (response.ok) {
                            window.location.href = self.successRedirect;
                        }
                    })
                    .fail(function () {
                        self.setErrorMessage($t('Shipment could not be created.'));
                    });
            }
        },

        newPackage: function () {
            if (packageState.allItemsPackaged() === false) {
                packageState.newPackage();
                self.reset();

                /** Apply item combination rules once to establish initial state */
                itemCombinationRules.apply(
                    self.shippingSettings.carriers[0].package_options
                );
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
        },

        /**
         * @param {string} message
         */
        setErrorMessage: function (message) {
            if (message) {
                window.packaging.messages.show();
                window.packaging.messages.textContent = message;
            } else {
                window.packaging.messages.hide();
            }
        }
    });
});
