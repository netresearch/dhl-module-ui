## Usage concepts

In general this module should only be required by the meta package.

All functionality provided will be activated through the Dhl_ShippingCore module.

## Features

### Estimated delivery date in checkout

Through additional data provided on a RateMethod these will be wrapped into an extension attribute 
(see `Dhl\ShippingCore\Api\Data\MethodAdditionalInfoInterface` - the available data keys are listed in this interface).

```php
<?php

$data = [Dhl\ShippingCore\Api\Data\MethodAdditionalInfoInterface::DELIVERY_DATE => 'Estimated delivery date'];

/** @var Dhl\ShippingCore\Model\Method\AdditionalInfoFactory $additionalInfoFactory */
$additionalInfo = $additionalInfoFactory->create([
                        'data' => $data
                    ]);


$priceInBaseCurrency = 5.0;
/** @var Magento\Quote\Model\Quote\Address\RateResult\MethodFactory $methodFactory */
$method = $methodFactory->create(
                [
                    'data' => [
                        'carrier' => 'my_carrier',
                        'carrier_title' => 'Carrier Title',
                        'method' => 'method_code',
                        'method_title' => 'Method Title',
                        'price' => $priceInBaseCurrency,
                        'cost' => $priceInBaseCurrency,

                        // Pass delivery date and carrier logo through specific 'additional_info' key
                        Dhl\ShippingCore\Api\Data\MethodAdditionalInfoInterface::ATTRIBUTE_KEY => $additionalInfo
                    ],
                ]
            );
```

This information will be used in {{Dhl\ShippingCore\Plugin\Quote\Cart\ShippingMethodConverterPlugin}} to get parsed into checkout as extension attributes

Output via: {{view/frontend/web/template/checkout/shipping/custom-method-item-template.html}}

### Carrier logo in checkout

Through additional data provided on a RateMethod these will be wrapped into an extension attribute 
(see `Dhl\ShippingCore\Api\Data\MethodAdditionalInfoInterface` - the available data keys are listed in this interface).

```php
<?php

$data = [Dhl\ShippingCore\Api\Data\MethodAdditionalInfoInterface::CARRIER_LOGO_URL => 'LOGO URL'];

/** @var Dhl\ShippingCore\Model\Method\AdditionalInfoFactory $additionalInfoFactory */
$additionalInfo = $additionalInfoFactory->create([
                        'data' => $data
                    ]);


$priceInBaseCurrency = 5.0;
/** @var Magento\Quote\Model\Quote\Address\RateResult\MethodFactory $methodFactory */
$method = $methodFactory->create(
                [
                    'data' => [
                        'carrier' => 'my_carrier',
                        'carrier_title' => 'Carrier Title',
                        'method' => 'method_code',
                        'method_title' => 'Method Title',
                        'price' => $priceInBaseCurrency,
                        'cost' => $priceInBaseCurrency,

                        // Pass delivery date and carrier logo through specific 'additional_info' key
                        Dhl\ShippingCore\Api\Data\MethodAdditionalInfoInterface::ATTRIBUTE_KEY => $additionalInfo
                    ],
                ]
            );
```

This information will be used in {{Dhl\ShippingCore\Plugin\Quote\Cart\ShippingMethodConverterPlugin}} to get parsed into checkout as extension attributes

Output via: {{view/frontend/web/template/checkout/shipping/custom-method-item-template.html}}

### Packaging Popup replacement:

Involved components:

* `Dhl\Ui\Observer\PackagingPopupObserver` -> can override the packaging popup template if the current shipping method supports that
    * to determine if a shipping method/carrier supports that, the `Dhl\ShippingCore\Model\Support\PackagingPopup` (or something like that) is called
    * the carrier with desire to register custom fields for the packaging popup generally registers itself to the corresponding ShippingCore model through di.xml
