define([
        "ko",
        'underscore',
        "Magento_Ui/js/form/form",
        'Magento_Ui/js/lib/spinner',
        'uiRegistry',
        'Dhl_Ui/js/packaging/model/available-items',
        'Dhl_Ui/js/packaging/model/shipment-data',
    ], function (ko, _, Component, loader, registry, availableItems, shipmentData) {
        return Component.extend({
            defaults: {
                activeFieldset: '',
                links: {
                    selectedItems: '${ $.provider }:data.selected_items',
                    activeFieldset: '${ $.provider }:data.active_fieldset',
                },
                listens: {
                    selectedItems: 'handleItemSelectChange',
                },
            },

            /**
             * @constructor
             * @TODO: handle form flow, provide save callback etc.
             **/
            initialize: function () {
                this._super();

                availableItems.set(this.source.get('data.selected_items'));

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
                this._super().observe(['activeFieldset']);

                return this;
            },

            handleItemSelectChange: function(items) {
                this.toggleReadyState(items);
                this.calculatePackageWeight();
            },

            /**
             * Update the package total weight input value
             * with data from the selected shipment items.
             *
             * @private
             */
            calculatePackageWeight: function() {
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
             * Set or unset shipmentData.readyForSubmit depending on wheter all orderItems are selected.
             *
             * @private
             * @param {string[]} selection Array of currently selected itemOrderIds
             */
            toggleReadyState: function(selection)
            {
                let remainingItems = availableItems.get()().length;
                shipmentData.setReadyForSubmit(selection.length > 0 && selection.length === remainingItems);
                shipmentData.setReadyForReset(selection.length > 0 && selection.length < remainingItems);
            },

            /**
             * Action target of "Next" buttons
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
                let remainingItems = availableItems.get()().filter(function(item) {
                    return this.selectedItems.indexOf(item.value) === -1;
                });
                availableItems.set(remainingItems);

                this._super();
            }
        });
    }
);
