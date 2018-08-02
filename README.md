## Usage concepts

In general this module should only be required by the meta package.

All functionality provided will be activated through the Dhl_ShippingCore module.

###  Example Packaging Popup:

Involved components:

* `Dhl\Ui\Observer\PackagingPopupObserver` -> can override the packaging popup template if the current shipping method supports that
    * to determine if a shipping method/carrier supports that, the `Dhl\ShippingCore\Model\Support\PackagingPopup` (or something like that) is called
    * the carrier with desire to register custom fields for the packaging popup generally registers itself to the corresponding ShippingCore model through di.xml