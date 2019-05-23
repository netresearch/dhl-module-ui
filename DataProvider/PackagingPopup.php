<?php
/**
 * See LICENSE.md for license details.
 */
declare(strict_types=1);

namespace Dhl\Ui\DataProvider;

use Dhl\ShippingCore\Model\Config\CoreConfigInterface;
use Magento\Framework\Api\SimpleDataObjectConverter;
use Magento\Framework\Registry;
use Magento\Sales\Model\Order;
use Magento\Ui\DataProvider\AbstractDataProvider;

/**
 * Class PackagingPopup
 *
 * @package Dhl\Ui\DataProvider
 * @author Paul Siedler <paul.siedler@netresearch.de>
 * @copyright 2018 Netresearch GmbH & Co. KG
 * @link http://www.netresearch.de/
 */
class PackagingPopup extends AbstractDataProvider
{
    /**
     * @var Registry
     */
    private $registy;

    /**
     * @var CoreConfigInterface
     */
    private $shippingCoreConfig;

    /**
     * @var Order\Shipment\Item[]
     */
    private $items;

    /**
     * PackagingPopup constructor.
     *
     * @param string $name
     * @param string $primaryFieldName
     * @param string $requestFieldName
     * @param Registry $registry
     * @param CoreConfigInterface $shippingCoreConfig
     * @param array $meta
     * @param array $data
     */
    public function __construct(
        string $name,
        string $primaryFieldName,
        string $requestFieldName,
        Registry $registry,
        CoreConfigInterface $shippingCoreConfig,
        array $meta = [],
        array $data = []
    ) {
        $this->registy = $registry;
        $this->shippingCoreConfig = $shippingCoreConfig;

        parent::__construct($name, $primaryFieldName, $requestFieldName, $meta, $data);
    }

    /**
     * @return mixed[][]
     */
    public function getData(): array
    {
        $result = [
            'items' => array_merge_recursive(
                $this->getItemInputs(),
                $this->getNextButton('dhl_fieldset_item_properties')
            ),
            'item_properties' => array_merge_recursive(
                $this->getItemPropertyGroups(),
                $this->getItemPropertyGroupDataSources(),
                $this->getNextButton('dhl_fieldset_package')
            ),
            'package' => array_merge_recursive(
                $this->getPackageInputs(),
                $this->getNextButton('dhl_fieldset_package_customs')
            ),
            'customs' => array_merge_recursive(
                [],
                $this->getNextButton('dhl_fieldset_services')
            ),
            'service' => array_merge_recursive(
                $this->getServiceInputs(),
                $this->getNextButton('dhl_fieldset_summary')
            ),
            'summary' => array_merge_recursive(
                []
            ),
            'available_items' => array_map(
                function ($item) {
                    /** @var Order\Shipment\Item $item */
                    return $item->getOrderItemId();
                },
                $this->getItems()
            ),
            'selected_items' => array_map(
                function ($item) {
                    /** @var Order\Shipment\Item $item */
                    return $item->getOrderItemId();
                },
                $this->getItems()
            ),
            'active_fieldset' => 'dhl_fieldset_items',
            'item_names' => $this->getItemNames(),
        ];

        return $this->normalizeKeys($result);
    }

    /**
     * Normalize array keys to snake_case to have the same data structure as is used in checkout REST API
     *
     * @param $dataArray
     * @return array
     */
    private function normalizeKeys($dataArray): array
    {
        $result = [];
        foreach ($dataArray as $key => $value) {
            if (is_array($value)) {
                $result[SimpleDataObjectConverter::camelCaseToSnakeCase($key)] = $this->normalizeKeys($value);
            } else {
                $result[SimpleDataObjectConverter::camelCaseToSnakeCase($key)] = $value;
            }
        }

        return $result;
    }

    /**
     * @return mixed[]
     */
    private function getServiceInputs(): array
    {
        return [
            'shippingOptions' => [
                [
                    'code' => 'preferredDay',
                    'label' => 'Wunschtag: Lieferung zum gewüschten Tag',
                    'enabledForCheckout' => true,
                    'enabledForAutocreate' => true,
                    'enabledForPackaging' => true,
                    'availableAtPostalFacility' => true,
                    'packagingReadonly' => true,
                    'sortOrder' => 10,
                    'routes' => [],
                    'inputs' => [
                        [
                            'code' => 'date',
                            'label' => 'Wunschtag',
                            'labelVisible' => false,
                            'options' => [
                                [
                                    'label' => 'keiner',
                                    'value' => '',
                                    'disabled' => false,
                                ],
                                [
                                    'label' => 'Do, 21.',
                                    'value' => '2019-02-21',
                                    'disabled' => false,
                                ],
                                [
                                    'label' => 'So, 24.',
                                    'value' => '2019-02-24',
                                    'disabled' => true,
                                ],
                                [
                                    'label' => 'Mo, 25.',
                                    'value' => '2019-02-25',
                                    'disabled' => false,
                                ],
                            ],
                            'tooltip' => 'Sie haben die Möglichkeit einen der angezeigten Tage als Wunschtag für die Lieferung Ihrer Waren auszuwählen. Andere Tage sind aufgrund der Lieferprozesse aktuell nicht möglich.',
                            'sortOrder' => 0,
                            'validationRules' => [
                                [
                                    'name' => 'dhl_not_allowed_with_parcelshop',
                                ],
                            ],
                            'inputType' => 'date',
                            'comment' => [
                                'content' => 'Für diesen ShippingOption fallen zusätzliche Versandkosten in Höhe von <strong>3,00 €</strong> inkl. MwSt. an.',
                                'footnoteId' => 'footnote-combined-cost',
                            ],
                        ],
                    ],
                ],
                [
                    'code' => 'preferredTime',
                    'label' => 'Wunschzeit: Lieferung im gewüschten Zeitfenster',
                    'enabledForCheckout' => true,
                    'enabledForAutocreate' => true,
                    'enabledForPackaging' => true,
                    'availableAtPostalFacility' => true,
                    'packagingReadonly' => true,
                    'sortOrder' => 15,
                    'routes' => [],
                    'inputs' => [
                        [
                            'code' => 'time',
                            'label' => 'Wunschzeit',
                            'labelVisible' => false,
                            'options' => [
                                [
                                    'label' => 'keine',
                                    'value' => '',
                                    'disabled' => false,
                                ],
                                [
                                    'label' => '10:00-12:00',
                                    'value' => '10001200',
                                    'disabled' => false,
                                ],
                                [
                                    'label' => '12:00-14:00',
                                    'value' => '12001400',
                                    'disabled' => true,
                                ],
                            ],
                            'tooltip' => 'Damit Sie besser planen können, haben Sie die Möglichkeit eine Wunschzeit für die Lieferung auszuwählen. Sie können eine der dargestellten Zeiten für die Lieferung auswählen.',
                            'sortOrder' => 0,
                            'validationRules' => [],
                            'inputType' => 'time',
                            'comment' => [
                                'content' => 'Für diesen ShippingOption fallen zusätzliche Versandkosten in Höhe von <strong>4,00 €</strong> inkl. MwSt. an',
                                'footnoteId' => 'footnote-combined-cost',
                            ],
                        ],
                    ],
                ],
                [
                    'code' => 'parcelAnnouncement',
                    'label' => 'Paketankündigung',
                    'enabledForCheckout' => true,
                    'enabledForAutocreate' => true,
                    'enabledForPackaging' => true,
                    'availableAtPostalFacility' => true,
                    'packagingReadonly' => true,
                    'sortOrder' => 40,
                    'routes' => [],
                    'inputs' => [
                        [
                            'code' => 'enabled',
                            'label' => 'Paketankündigung aktivieren',
                            'labelVisible' => true,
                            'options' => [],
                            'tooltip' => 'Ihre E-Mail-Adresse wird bei Aktivierung an DHL übermittelt, worauf DHL eine Paketankündigung zu Ihrer Sendung auslöst. Die E-Mail-Adresse wird ausschließlich für die Ankündigung zu dieser Sendung verwendet.',
                            'sortOrder' => 0,
                            'validationRules' => [],
                            'inputType' => 'checkbox',
                            'comment' => [
                                'content' => 'Mit der Aktivierung der Paketankündigung informiert Sie DHL per E-Mail über die geplante Lieferung Ihrer Sendung.',
                            ],
                        ],
                    ],
                ],
                [
                    'code' => 'preferredLocation',
                    'label' => 'Wunschort: Lieferung an den gewüschten Ablageort',
                    'enabledForCheckout' => true,
                    'enabledForAutocreate' => false,
                    'enabledForPackaging' => false,
                    'availableAtPostalFacility' => false,
                    'packagingReadonly' => true,
                    'sortOrder' => 60,
                    'routes' => [],
                    'inputs' => [
                        [
                            'code' => 'details',
                            'label' => 'Wunschort',
                            'labelVisible' => false,
                            'options' => [],
                            'tooltip' => 'Bestimmen Sie einen wettergeschützten und nicht einsehbaren Platz auf Ihrem Grundstück, an dem wir das Paket während Ihrer Abwesenheit hinterlegen dürfen.',
                            'placeholder' => 'z.B. Garage, Terrasse',
                            'sortOrder' => 0,
                            'validationRules' => [
                                [
                                    'name' => 'maxLength',
                                    'params' => 40,
                                ],
                                [
                                    'name' => 'validate-no-html-tags',
                                ],
                                [
                                    'name' => 'dhl_filter_special_chars',
                                ],
                            ],
                            'inputType' => 'text',
                            'defaultValue' => '',
                        ],
                    ],
                ],
                [
                    'code' => 'preferredNeighbour',
                    'label' => 'Wunschnachbar: Lieferung an den Nachbar Ihrer Wahl',
                    'enabledForCheckout' => true,
                    'enabledForAutocreate' => true,
                    'enabledForPackaging' => true,
                    'availableAtPostalFacility' => true,
                    'packagingReadonly' => true,
                    'sortOrder' => 70,
                    'routes' => [],
                    'inputs' => [
                        [
                            'code' => 'name',
                            'label' => 'Name des Nachbarn',
                            'labelVisible' => true,
                            'options' => [],
                            'tooltip' => 'Bestimmen Sie eine Person in Ihrer unmittelbaren Nachbarschaft, bei der wir Ihr Paket abgeben dürfen. Diese sollte im gleichen Haus, direkt gegenüber oder nebenan wohnen.',
                            'placeholder' => 'Vorname, Nachname des Nachbarn',
                            'sortOrder' => 0,
                            'validationRules' => [
                                [
                                    'name' => 'maxLength',
                                    'params' => 40,
                                ],
                                [
                                    'name' => 'validate-no-html-tags',
                                ],
                                [
                                    'name' => 'dhl_filter_special_chars',
                                ],
                            ],
                            'inputType' => 'text',
                            'defaultValue' => '',
                        ],
                        [
                            'code' => 'address',
                            'label' => 'Adresse des Nachbarn',
                            'labelVisible' => true,
                            'options' => [],
                            'tooltip' => 'Test tooltip',
                            'placeholder' => 'Strasse, Hausnummer, PLZ, Ort',
                            'sortOrder' => 0,
                            'validationRules' => [
                                [
                                    'name' => 'maxLength',
                                    'params' => 40,
                                ],
                                [
                                    'name' => 'validate-no-html-tags',
                                ],
                                [
                                    'name' => 'dhl_filter_special_chars',
                                ],
                            ],
                            'inputType' => 'text',
                        ],
                    ],
                ],
            ],
            'metadata' => [
                'title' => 'DHL Preferred Delivery. Delivered just the way you want.',
                'imageUrl' => '',
                'commentsBefore' => [
                    [
                        'content' => 'DHL Preferred Delivery. Delivered just the way you want.',
                    ],
                    [
                        'content' => 'Kurze Anleitung wie das ganze funktioniert. Ut a lorem vel quam finibus venenatis. Phasellus urna libero, sollicitudin id leo nec.',
                    ],
                ],
                'commentsAfter' => [
                    [
                        'content' => 'A test comment below the service selection.',
                    ],
                ],
                'footnotes' => [
                    [
                        'content' => 'When booked together, the price of Preferred Day and Preferred Time is <strong>11 €</strong>.',
                        'footnoteId' => 'footnote-combined-cost',
                        'subjects' => ['preferredTime', 'preferredDay'],
                        'subjectsMustBeSelected' => true,
                        'subjectsMustBeAvailable' => true,
                    ],
                ],
            ],
            'compatibilityData' => [
                [
                    'incompatibilityRule' => true,
                    'subjects' => ['preferredLocation', 'preferredNeighbour'],
                    'errorMessage' => 'Please choose only one of %1.',
                ],
                [
                    'incompatibilityRule' => false,
                    'subjects' => ['preferredNeighbour.name', 'preferredNeighbour.address'],
                    'errorMessage' => 'Some values for Preferred Neighbour service are missing.',
                ],
                [
                    'incompatibilityRule' => false,
                    'subjects' => ['preferredDay', 'preferredTime'],
                    'errorMessage' => 'Services %1 require each other.',
                ],
            ],
        ];
    }

    /**
     * @return mixed[]
     */
    private function getPackageInputs(): array
    {
        $result = [];
        $totalWeight = array_reduce(
            $this->getItems(),
            function (float $carry, Order\Shipment\Item $item) {
                return $carry + $item->getWeight();
            },
            0
        );
        $weightUnit = $this->shippingCoreConfig->getWeightUnit($this->getItems()[0]->getShipment()->getStoreId());
        $result['shippingOptions'][] = [
            'code' => 'total_weight',
            'label' => __('Total Weight (%1)', $weightUnit),
            'enabledForCheckout' => true,
            'enabledForAutocreate' => true,
            'enabledForPackaging' => true,
            'availableAtPostalFacility' => true,
            'packagingReadonly' => false,
            'sortOrder' => 10,
            'routes' => [],
            'inputs' => [
                [
                    'code' => 'weight',
                    'label' => 'Weight',
                    'labelVisible' => false,
                    'options' => [],
                    'tooltip' => 'Note that this is an estimation only. If the weight of your physical package differs, different rates may apply.',
                    'sortOrder' => 0,
                    'validationRules' => [],
                    'inputType' => 'text',
                    'defaultValue' => $totalWeight,
                ],

            ],
        ];
        $result['shippingOptions'][] = [
            'code' => 'package_type',
            'label' => __('Type'),
            'enabledForCheckout' => true,
            'enabledForAutocreate' => true,
            'enabledForPackaging' => true,
            'availableAtPostalFacility' => true,
            'packagingReadonly' => false,
            'sortOrder' => 10,
            'routes' => [],
            'inputs' => [
                [
                    'code' => 'type',
                    'label' => 'Please select',
                    'labelVisible' => false,
                    'options' => $this->getPackageTypes(),
                    'tooltip' => __('You can manage your package types in the shipping method configuration section.'),
                    'sortOrder' => 0,
                    'validationRules' => [],
                    'inputType' => 'radio',
                    'defaultValue' => '',
                ],

            ],
        ];
        $result['shippingOptions'][] = [
            'code' => 'dimensions',
            'label' => __('Dimensions'),
            'enabledForCheckout' => true,
            'enabledForAutocreate' => true,
            'enabledForPackaging' => true,
            'availableAtPostalFacility' => true,
            'packagingReadonly' => false,
            'sortOrder' => 10,
            'routes' => [],
            'inputs' => [
                [
                    'code' => 'width',
                    'label' => __('Width'),
                    'labelVisible' => true,
                    'options' => [],
                    'sortOrder' => 0,
                    'validationRules' => [],
                    'inputType' => 'text',
                    'defaultValue' => '',
                ],
                [
                    'code' => 'height',
                    'label' => __('Height'),
                    'labelVisible' => true,
                    'options' => [],
                    'sortOrder' => 0,
                    'validationRules' => [],
                    'inputType' => 'text',
                    'defaultValue' => '',
                ],
                [
                    'code' => 'depth',
                    'label' => __('Depth'),
                    'labelVisible' => true,
                    'options' => [],
                    'sortOrder' => 0,
                    'validationRules' => [],
                    'inputType' => 'text',
                    'defaultValue' => '',
                ],

            ],
        ];
        $result['shippingOptions'][] = [
            'code' => 'dimension_unit',
            'label' => __('Dimension Unit'),
            'enabledForCheckout' => true,
            'enabledForAutocreate' => true,
            'enabledForPackaging' => true,
            'availableAtPostalFacility' => true,
            'packagingReadonly' => false,
            'sortOrder' => 10,
            'routes' => [],
            'inputs' => [
                [
                    'code' => 'type',
                    'label' => 'Please select',
                    'labelVisible' => false,
                    'options' => $this->getDimensionUnits(),
                    'sortOrder' => 0,
                    'validationRules' => [],
                    'inputType' => 'radio',
                    'defaultValue' => $this->getDimensionUnits()[0]['value'],
                ],

            ],
        ];

        return $result;
    }

    /**
     * @return mixed[]
     */
    private function getItemInputs(): array
    {
        $result = [];
        $result['shippingOptions'] = [];
        /** @var Order\Shipment\Item $item */
        foreach ($this->getItems() as $item) {
            $result['shippingOptions'][] = [
                'code' => 'item_' . $item->getOrderItemId(),
                'label' => $item->getName(),
                'enabledForCheckout' => true,
                'enabledForAutocreate' => true,
                'enabledForPackaging' => true,
                'availableAtPostalFacility' => true,
                'packagingReadonly' => false,
                'sortOrder' => 10,
                'routes' => [],
                'inputs' => [
                    [
                        'code' => 'enabled_' . $item->getOrderItemId(),
                        'label' => '',
                        'labelVisible' => false,
                        'sortOrder' => 0,
                        'validationRules' => [],
                        'inputType' => 'checkbox',
                        'defaultValue' => true,
                    ],
                    [
                        'code' => 'qty',
                        'label' => __('Qty.'),
                        'labelVisible' => true,
                        'sortOrder' => 10,
                        'validationRules' => [],
                        'inputType' => 'text',
                        'defaultValue' => $item->getQty(),
                    ],

                ],
            ];
        }

        return $result;
    }

    /**
     * @return mixed[]
     */
    private function getItemPropertyGroups(): array
    {
        $result = [];
        foreach ($this->getItems() as $item) {
            $result['shippingOptions'][] =
                [
                    'code' => 'dhl_item_properties_' . $item->getOrderItemId(),
                    'label' => $item->getName(),
                    'enabledForCheckout' => true,
                    'enabledForAutocreate' => true,
                    'enabledForPackaging' => true,
                    'availableAtPostalFacility' => true,
                    'packagingReadonly' => false,
                    'sortOrder' => 10,
                    'routes' => [],
                    'inputs' => [
                        [
                            'code' => 'qty',
                            'label' => __('Qty.'),
                            'labelVisible' => true,
                            'sortOrder' => 10,
                            'validationRules' => [],
                            'inputType' => 'text',
                            'defaultValue' => $item->getQty(),
                        ],
                        [
                            'code' => 'weight',
                            'label' => __('Weight'),
                            'labelVisible' => true,
                            'sortOrder' => 20,
                            'validationRules' => [],
                            'inputType' => 'text',
                            'defaultValue' => $item->getWeight(),
                            'disabled' => true,
                        ],
                        [
                            'code' => 'description',
                            'label' => __('Description'),
                            'labelVisible' => true,
                            'sortOrder' => 30,
                            'validationRules' => [],
                            'inputType' => 'textarea',
                            'defaultValue' => $item->getDescription() ?? $item->getName(),
                        ],

                    ],

                ];
            //            $result['shippingOptions'][] = [
            //                'component' => 'Dhl_Ui/js/packaging/view/item-properties-fieldset',
            //                'label' => $item->getName(),
            //                'orderItemId' => $item->getOrderItemId(),
            //                'provider' => 'dhl_packaging_popup.dhl_packaging_popup_data_source',
            //                'dataScope' => 'item' . $item->getOrderItemId(),
            //                'dataScopeSelectedItems' => 'data.selected_items',
            //            ];
        }

        return $result;
    }

    /**
     * @return mixed[]
     */
    private function getItemNames(): array
    {
        $items = [];
        foreach ($this->getItems() as $item) {
            $items[$item->getOrderItemId()] = $item->getName() . ' (' . __('Qty') . ': ' . $item->getQty() . ')';
        }

        return $items;
    }

    /**
     * @return Order\Shipment\Item[]
     */
    private function getItems(): array
    {
        if ($this->items === null) {
            $shipment = $this->registy->registry('current_shipment');
            $this->items = $shipment->getAllItems();
        }

        return $this->items;
    }

    /**
     * @return mixed[]
     */
    private function getPackageTypes(): array
    {
        return [
            [
                'label' => 'type 1',
                'value' => 'type 1',
            ],
            [
                'label' => 'type 2',
                'value' => 'type 2',
            ],
        ];
    }

    /**
     * @return string[][]
     */
    private function getDimensionUnits(): array
    {
        return [
            [
                'label' => 'cm',
                'value' => 'CENTIMETER',
            ],
            [
                'label' => 'in',
                'value' => 'INCH',
            ],
        ];
    }

    /**
     * @param string $nextFieldsetName
     * @return mixed[][]
     */
    private function getNextButton(string $nextFieldsetName): array
    {
        $result['components'][] = [
            'nodeTemplate' => 'dhl_packaging_popup.dhl_packaging_popup.dhl_button_next',
            'nextFieldsetName' => $nextFieldsetName,
        ];

        return $result;
    }
}
