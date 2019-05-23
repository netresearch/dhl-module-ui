<?php
/**
 * See LICENSE.md for license details.
 */
declare(strict_types=1);

namespace Dhl\Ui\ViewModel\Order\Packaging;

use Dhl\ShippingCore\Model\Config\CoreConfigInterface;
use Magento\Framework\Api\SimpleDataObjectConverter;
use Magento\Framework\Registry;
use Magento\Framework\View\Element\Block\ArgumentInterface;
use Magento\Sales\Api\Data\ShipmentInterface;
use Magento\Sales\Model\Order\Shipment;
use Magento\Sales\Model\Order\Shipment\Item;

/**
 * Class Popup
 *
 * @author Paul Siedler <paul.siedler@netresearch.de>
 * @link https://www.netresearch.de/
 */
class Popup implements ArgumentInterface
{

    /**
     * @var Registry
     */
    private $registry;

    /**
     * @var CoreConfigInterface
     */
    private $shippingCoreConfig;

    /**
     * @var ShipmentInterface|Shipment
     */
    private $shipment;

    /**
     * Popup constructor.
     *
     * @param Registry $registry
     * @param CoreConfigInterface $shippingCoreConfig
     */
    public function __construct(
        Registry $registry,
        CoreConfigInterface $shippingCoreConfig
    ) {
        $this->registry = $registry;
        $this->shippingCoreConfig = $shippingCoreConfig;
    }

    /**
     * @return ShipmentInterface|Shipment
     */
    private function getShipment()
    {
        if ($this->shipment === null) {
            $this->shipment = $this->registry->registry('current_shipment');
        }

        return $this->shipment;
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

    public function getPackageOptions(): array
    {
        $result = [];
        $totalWeight = array_reduce(
            $this->getShipment()->getAllItems(),
            function (float $carry, Item $item) {
                return $carry + $item->getWeight();
            },
            0
        );
        $weightUnit = $this->shippingCoreConfig->getWeightUnit($this->getShipment()->getStoreId());
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

    public function getItemOptions(): array
    {
        $result = [];

        $result['shippingOptions'] = [
            [
                'code' => 'product_name',
                'label' => 'Product name',
                'enabledForCheckout' => true,
                'enabledForAutocreate' => true,
                'enabledForPackaging' => true,
                'availableAtPostalFacility' => true,
                'packagingReadonly' => true,
                'sortOrder' => 10,
                'routes' => [],
                'inputs' => [
                    [
                        'code' => 'name',
                        'label' => 'Product name',
                        'labelVisible' => true,
                        'options' => [],
                        'sortOrder' => 0,
                        'validationRules' => [],
                        'inputType' => 'text',
                        'isDisabled' => true,
                        'comment' => [],
                    ],
                ],
            ],
        ];

        return $this->normalizeKeys($result);
    }

    public function getServiceOptions(): array
    {
        $result = [
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

        return $this->normalizeKeys($result);
    }

    public function getItemData(): array
    {
        $result = array_reduce(
            $this->getShipment()->getAllItems(),
            /**
             * @var string[] $carry
             * @var Item $item
             */
            function ($carry, $item) {
                $carry[] = $item->getData();

                return $carry;
            },
            []
        );

        return $this->normalizeKeys($result);
    }
}
