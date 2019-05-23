define([
        "ko",
        'underscore',
        "Magento_Ui/js/form/form",
        'Magento_Ui/js/lib/spinner',
        'uiRegistry',
        'Dhl_Ui/js/packaging/model/shipment-data',
        'Dhl_Ui/js/packaging/action/rebuild-packing-items',
    ], function (ko, _, Component, loader, registry, shipmentData, rebuildPackingItemsAction) {
        return Component.extend({
            /**
             * This controller Component collects data from the PackagingPopup Data Provider and handles changes to the
             * data. It also uses built-in form functionality to submit the final shipment request to Magento.
             */
            defaults: {
                items: [],
                itemOptions: [],
                packageOptions: [],
                serviceOptions: [],
                itemNames: {},
                imports: {
                    itemNames: '${ $.provider }:data.item_names'
                },
                links: {
                    availableItems: '${ $.provider }:data.available_items',
                    selectedItems: '${ $.provider }:data.selected_items',
                    activeFieldset: '${ $.provider }:data.active_fieldset',
                },
                listens: {
                    selectedItems: 'handleItemSelectChange',
                    availableItems: 'handleAvailableItemsChange'
                },
            },

            /**
             * @constructor
             **/
            initialize: function () {
                this._super();

                shipmentData.isReadyForSubmit().subscribe(function (isReady) {
                    registry.get({index: 'dhl_button_submit'}, function (button) {
                        button.disabled(!isReady);
                    });
                });
                shipmentData.isReadyForReset().subscribe(function (isReady) {
                    registry.get({index: 'dhl_button_new_package'}, function (button) {
                        button.disabled(!isReady);
                    });
                });
            },

            initChildren: function () {
                this._super();
                
            },

            /** @inheritdoc */
            initObservable: function () {
                this._super().observe(['activeFieldset', 'availableItems', 'selectedItems']);

                return this;
            },

            /**
             * Whenever the selected Packing Items change, check which actions are available and calculate the current
             * total shipment weight.
             *
             * @param {string[]} items
             */
            handleItemSelectChange: function (items) {
                this.toggleReadyState(items);
                this.calculatePackageWeight(items);
            },

            /**
             * Update the package total weight input value with data from the selected shipment items.
             *
             * @param {string[]} itemIds
             * @private
             */
            calculatePackageWeight: function (itemIds) {
                registry.get({index: 'total_weight'}, function (totalWeightComponent) {
                    /** Get the weight components for items that are selected. */
                    let weightComponents = registry.filter(function (component) {
                        let isItemWeightComponent = component.index === 'dhl_item_weight';
                        let isActive = itemIds.includes(component.orderItemId);

                        return isItemWeightComponent && isActive;
                    });
                    /** Add up weight values of retrieved components. */
                    let newWeight = 0.0;
                    weightComponents.forEach(function (component) {
                        newWeight += parseFloat(component.value.peek());
                    });
                    totalWeightComponent.value(newWeight);
                });
            },

            /**
             * Set or unset shipmentData.readyForSubmit and readyForReset depending on wheter all or no orderItems are
             * selected.
             *
             * @private
             * @param {string[]} selection Array of currently selected itemOrderIds
             */
            toggleReadyState: function (selection) {
                let remainingItems = this.availableItems().length;
                shipmentData.setReadyForSubmit(selection.length > 0 && selection.length === remainingItems);
                shipmentData.setReadyForReset(selection.length > 0 && selection.length < remainingItems);
            },

            /**
             * Action target of "Next" buttons.
             *
             * @public
             * @param {string} fieldset
             */
            setActiveFieldset: function (fieldset) {
                this.activeFieldset(fieldset);
            },

            /**
             * Hide loader.
             *
             * Overridden to get around obtuse spinner naming problem with the parent class.
             *
             * @protected
             * @returns {Object}
             */
            hideLoader: function () {
                loader.get(this.name + '.dhl_packaging_popup_spinner').hide();

                return this;
            },

            /**
             * On reset, recalculate the available Packing Items and select all remaining items.
             *
             * @protected
             */
            reset: function () {
                let remainingItems = _.difference(this.availableItems(), this.selectedItems());
                this.availableItems(remainingItems);
                this.selectedItems(remainingItems);

                this._super();
            },

            /**
             * The available Packing items have changed.
             *
             * @param {string[]} availableItems
             */
            handleAvailableItemsChange: function (availableItems) {
                if (!_.isEmpty(this.itemNames)) {
                    rebuildPackingItemsAction(
                        availableItems,
                        this.name + '.dhl_fieldset_items',
                        this.itemNames
                    );
                }
            }
        });
    }
);
