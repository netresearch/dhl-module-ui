define([
        "ko",
        'underscore',
        "Magento_Ui/js/form/form",
        'Magento_Ui/js/lib/spinner',
        'uiRegistry',
        'Dhl_Ui/js/packaging/model/active-fieldset',
        'Dhl_Ui/js/packaging/model/selected-items',
    ], function (ko, _, Component, loader, registry, activeFieldset, selectedItems) {
        return Component.extend({
            /**
             * @constructor
             * @TODO: handle form flow, provide save callback etc.
             **/
            initialize: function () {
                this._super();
                this.loadOrderItemSelection();
                selectedItems.get().subscribe(this.toggleItemPropertiesVisibility);
                selectedItems.get().subscribe(this.calculatePackageWeight);
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
             * @public
             * @param {string} fieldset
             */
            setActiveFieldset: function (fieldset) {
                activeFieldset.set(fieldset);
            }
        });
    }
);
