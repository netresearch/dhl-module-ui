define([
    "ko",
    'underscore',
    "uiCollection",
    'Dhl_Ui/js/packaging/model/package-state',
    'Dhl_Ui/js/model/shipping-option/selections',
    'uiLayout',
    'mageUtils'
], function (ko, _, Component, packageState, selections, layout, utils) {
    var self;
    return Component.extend({
        defaults: {
            template: 'Dhl_Ui/packaging/control',
            items: [],
            itemOptions: [],
            packageOptions: [],
            serviceOptions: []
        },
        fieldsetTemplate: {
            component: 'Dhl_Ui/js/packaging/view/fieldset',
            label: '${ $.$data.label }',
            name: '${ $.$data.name }',
            parent: '${ $.$data.parent }',
            config: {
                shippingOptions: [],
                activeFieldset: ''
            }
        },

        packages: packageState.packages,
        currentPackage: packageState.currentPackage,

        initialize: function () {
            self = this;
            self._super();
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
                self.generateFieldset('package', 'Package options', self.packageOptions),
                self.generateFieldset('service', 'Service options', self.serviceOptions)
            ];
            layout(fieldsets);
        },

        generateItemSelectionFieldset: function () {
            var baseFieldset = self.generateFieldset('item', 'Package items', self.itemOptions);
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
                activeFieldset: packageState.currentSection
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
            console.log(selections.getAll().map((f) => f()));
        }
    });
});
