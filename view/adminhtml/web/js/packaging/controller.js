define([
        "ko",
        'underscore',
        "Magento_Ui/js/form/form",
        'Magento_Ui/js/lib/spinner',
        'uiRegistry',
        'Dhl_Ui/js/packaging/model/active-fieldset',
        'Dhl_Ui/js/packaging/model/selected-items',
        'Dhl_Ui/js/packaging/model/shipment-data',
    ], function (ko, _, Component, loader, registry, activeFieldset, selectedItems, shipmentData) {
        return Component.extend({
            defaults: {
                /**
                 * Total amount of order items to be included in this shipment.
                 */
                orderItemAmount: 0,
            },

            /**
             * @constructor
             * @TODO: handle form flow, provide save callback etc.
             **/
            initialize: function () {
                this._super();
                this.loadOrderItemSelection();

                this.orderItemAmount = this.source.get('data.itemAmount');

                selectedItems.get().subscribe(this.toggleItemPropertiesVisibility);

                selectedItems.get().subscribe(this.toggleReadyState.bind(this));

                selectedItems.get().subscribe(this.calculatePackageWeight);

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

            /**
             * Sync selectedItems model with checkbox set component value
             *
             * @private
             */
            loadOrderItemSelection: function () {
                registry.get({index: 'dhl_order_items'}, function (component) {
                    component.value.subscribe(function (items) {
                        selectedItems.set(items);
                    });
                }.bind(this));
            },

            /**
             * Go through all item property containers and
             * hide the ones whose item is not selected.
             *
             * @private
             * @param {string[]} selection Array of currently selected itemOrderIds
             */
            toggleItemPropertiesVisibility: function(selection) {
                let components = registry.filter({dhlType: 'dhl_item_properties_container'});

                components.forEach(function (component) {
                    if (selection.indexOf(component.orderItemId) === -1) {
                        component.visible(false);
                    } else {
                        component.visible(true);
                    }
                });
            },

            /**
             * Update the package total weight input value
             * with data from the selected shipment items.
             *
             * @private
             */
            calculatePackageWeight: function() {
                let totalWeightComponent = registry.get({index: 'total_weight'});
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
            },

            /**
             * Set or unset shipmentData.readyForSubmit depending on wheter all orderItems are selected.
             *
             * @private
             * @param {string[]} selection Array of currently selected itemOrderIds
             */
            toggleReadyState: function(selection)
            {
                shipmentData.setReadyForSubmit(selection.length > 0 && selection.length === this.orderItemAmount);
                shipmentData.setReadyForReset(selection.length > 0 && !shipmentData.isReadyForSubmit()());
            },

            /**
             * @public
             * @param {string} fieldset
             */
            setActiveFieldset: function (fieldset) {
                activeFieldset.set(fieldset);
            },

            /**
             * Hide loader.
             *
             * Overriden to get around obtuse spinner naming problem with the parent class.
             * @TODO: Figure out how this Component needs to be configured to work automatically.
             *
             * @protected
             * @returns {Object}
             */
            hideLoader: function () {
                loader.get(this.name + '.dhl_packaging_popup_spinner').hide();

                return this;
            },

            /**
             * Remove all previously selected order items from the form before resetting
             *
             * @protected
             */
            reset: function () {
                registry.get({index: 'dhl_order_items'}, function (component) {
                    let newOptions = component.options().filter(function (option) {
                        return (selectedItems.get()().indexOf(option.value) === -1)
                    });
                    component.options(newOptions);
                });
                this._super();
            }
        });
    }
);
