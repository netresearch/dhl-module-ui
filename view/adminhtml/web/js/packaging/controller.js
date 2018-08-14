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
                    registry.get({index: 'buttonSubmit'}, function (button) {
                        button.disabled(!isReady);
                    });
                });
                shipmentData.isReadyForReset().subscribe(function (isReady) {
                    registry.get({index: 'buttonReset'}, function (button) {
                        button.disabled(!isReady);
                    });
                });
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
             * @param {int[]} items
             */
            handleItemSelectChange: function (items) {
                this.toggleReadyState(items);
                this.calculatePackageWeight();
            },

            /**
             * Update the package total weight input value with data from the selected shipment items.
             *
             * @private
             */
            calculatePackageWeight: function () {
                registry.get({index: 'total_weight'}, function (totalWeightComponent) {
                    let weightComponents = registry.filter({dhlType: 'dhl_item_weight'});
                    let newWeight = 0.0;
                    weightComponents.forEach(function (component) {
                        let parent = registry.get({name: component.parent});
                        if (parent.visible()) {
                            let itemWeight = parseFloat(component.value.peek());
                            if (itemWeight) {
                                newWeight += itemWeight;
                            }
                        }
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
             * Overriden to get around obtuse spinner naming problem with the parent class.
             *
             * @protected
             * @returns {Object}
             */
            hideLoader: function () {
                loader.get(this.name + '.dhl_packaging_popup_spinner').hide();

                return this;
            },

            /**
             * Recalculate the available Packing Items, select all remaining items on reset.
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
             * @param {int[]} availableItems
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
