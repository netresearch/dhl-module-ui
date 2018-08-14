<?php
/**
 * See LICENSE.md for license details.
 */
declare(strict_types=1);

namespace Dhl\Ui\DataProvider;

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
     * @param array $meta
     * @param array $data
     */
    public function __construct(
        string $name,
        string $primaryFieldName,
        string $requestFieldName,
        Registry $registry,
        array $meta = [],
        array $data = []
    ) {
        $this->registy = $registry;

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
                $this->getExportPackageInputs(),
                $this->getNextButton('dhl_fieldset_services')
            ),
            'service' => array_merge_recursive(
                $this->getServiceInputs(),
                $this->getNextButton('dhl_fieldset_summary')
            ),
            'summary' => array_merge_recursive(
                $this->getNewPackageButton(),
                $this->getSubmitButton()
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

        return $result;
    }

    /**
     * @return mixed[]
     */
    private function getServiceInputs(): array
    {
        /** @TODO: use provider classes for input retrieval */
        return [];
    }

    /**
     * @return mixed[]
     */
    private function getPackageInputs(): array
    {
        $result = [];
        $totalWeight = array_reduce($this->getItems(), function (?float $carry, Order\Shipment\Item $item) {
            return $carry + $item->getWeight();
        });
        $result['components'][] = [
            'component' => 'Magento_Ui/js/form/element/abstract',
            'template' => 'ui/form/field',
            'elementTmpl' => 'ui/form/element/select',
            'label' => 'Type',
            'options' => $this->getPackageTypes(),
            'caption' => 'none',
        ];
        $result['components'][] = [
            'component' => 'Magento_Ui/js/form/element/abstract',
            'template' => 'ui/form/field',
            'name' => 'total_weight',
            'label' => 'Total Weight',
            'value' => $totalWeight,
        ];
        $result['components'][] = [
            'component' => 'Magento_Ui/js/form/element/abstract',
            'template' => 'ui/form/field',
            'elementTmpl' => 'ui/form/element/select',
            'label' => 'Weight Unit',
            'options' => $this->getWeightUnits(),
            'caption' => 'Please select',
            'value' => $this->getWeightUnits()[0]['value']
        ];
        $result['components'][] = [
            'component' => 'Magento_Ui/js/form/element/abstract',
            'template' => 'ui/form/field',
            'label' => 'Width',
        ];
        $result['components'][] = [
            'component' => 'Magento_Ui/js/form/element/abstract',
            'template' => 'ui/form/field',
            'label' => 'Height',
        ];
        $result['components'][] = [
            'component' => 'Magento_Ui/js/form/element/abstract',
            'template' => 'ui/form/field',
            'label' => 'Depth',
        ];
        $result['components'][] = [
            'component' => 'Magento_Ui/js/form/element/abstract',
            'template' => 'ui/form/field',
            'elementTmpl' => 'ui/form/element/select',
            'label' => 'Dimension Unit',
            'options' => $this->getDimensionUnits(),
            'caption' => 'Please select',
            'value' => $this->getDimensionUnits()[0]['value']
        ];

        return $result;
    }

    /**
     * @return mixed[]
     */
    private function getExportPackageInputs(): array
    {
        /** @TODO: use provider classes for input retrieval */
        return [];
    }

    /**
     * @return mixed[]
     */
    private function getItemInputs(): array
    {
        $options = [];
        /** @var Order\Shipment\Item $item */
        foreach ($this->getItems() as $item) {
            $options[] = [
                'value' => $item->getOrderItemId(),
                'label' => $item->getName() . ' (Qty: ' . $item->getQty() . ')',
            ];
        }
        $result['components'][] = [
            'component' => 'Magento_Ui/js/form/element/checkbox-set',
            'name' => 'dhl_order_items',
            'label' => 'Order Items',
            'provider' => 'dhl_packaging_popup.dhl_packaging_popup_data_source',
            'multiple' => true,
            'links' => [
                'value' => '${ $.provider }:data.selected_items'
            ],
            'isTemplate' => true,
        ];
        $result['components'][] = [
            'nodeTemplate' => 'dhl_packaging_popup.dhl_packaging_popup.dhl_fieldset_items.dhl_order_items',
            'options' => $options,
        ];

        return $result;
    }

    /**
     * @return mixed[]
     */
    private function getItemPropertyGroups(): array
    {
        $result = [];
        foreach ($this->getItems() as $item) {
            $result['components'][] = [
                'component' => 'Dhl_Ui/js/packaging/view/item-properties-fieldset',
                'label' => $item->getName(),
                'dhlType' => 'dhl_item_properties_container',
                'orderItemId' => (string)$item->getOrderItemId(),
                'provider' => 'dhl_packaging_popup.dhl_packaging_popup_data_source',
                'dataScope' => 'item' . $item->getOrderItemId(),
                'dataScopeSelectedItems' => 'data.selected_items',
            ];
        }
        return $result;
    }

    /**
     * @return mixed[]
     */
    private function getItemPropertyGroupDataSources(): array
    {
        $result = [];
        foreach ($this->getItems() as $item) {
            $result['item' . $item->getOrderItemId()]['components'] = array_merge(
                $this->getItemPropertyInputs($item),
                $this->getExportItemInputs($item)
            );
        }

        return $result;
    }

    /**
     * @param Order\Shipment\Item $item
     * @return mixed[]
     */
    private function getItemPropertyInputs(Order\Shipment\Item $item): array
    {
        $result = [];
        $result[] = [
            'component' => 'Magento_Ui/js/form/element/abstract',
            'template' => 'ui/form/field',
            'label' => 'Weight',
            'dhlType' => 'dhl_item_weight',
            'value' => $item->getWeight(),
            'disabled' => true,
        ];
        $result[] = [
            'component' => 'Magento_Ui/js/form/element/abstract',
            'template' => 'ui/form/field',
            'label' => 'Qty ordered',
            'value' => $item->getQty(),
            'disabled' => true,
        ];
        $result[] = [
            'component' => 'Magento_Ui/js/form/element/abstract',
            'template' => 'ui/form/field',
            'elementTmpl' => 'ui/form/element/textarea',
            'cols' => 5,
            'rows' => 60,
            'label' => 'Description',
            'value' => $item->getDescription(),
        ];

        return $result;
    }

    /**
     * @return mixed[]
     */
    private function getItemNames(): array
    {
        $items = [];
        foreach ($this->getItems() as $item) {
            $items[$item->getOrderItemId()] = $item->getName() . ' (Qty: ' . $item->getQty() . ')';
        }

        return $items;
    }

    /**
     * @param Order\Shipment\Item $item
     * @return mixed[]
     */
    private function getExportItemInputs(Order\Shipment\Item $item): array
    {
        /** @TODO: use provider classes for input retrieval */
        return [];
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
    private function getWeightUnits(): array
    {
        return [
            [
                'label' => 'kg',
                'value' => 'KILOGRAM',
            ],
            [
                'label' => 'lb',
                'value' => 'POUND',
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
            'component' => 'Magento_Ui/js/form/components/button',
            'name' => 'buttonNext',
            'title' => 'Next',
            'buttonClasses' => 'primary',
            'actions' => [
                [
                    'targetName' => 'dhl_packaging_popup.dhl_packaging_popup',
                    'actionName' => 'setActiveFieldset',
                    'params' => ['dhl_fieldset_item_properties']
                ]
            ],
            'isTemplate' => true,
        ];
        $result['components'][] = [
            'nodeTemplate' => 'dhl_packaging_popup.dhl_packaging_popup.dhl_fieldset_items.buttonNext',
            'actions' => [
                [
                    'params' => [$nextFieldsetName]
                ]
            ],
        ];

        return $result;
    }

    /**
     * @return mixed[][]
     */
    private function getSubmitButton(): array
    {
        $result['components'][] = [
            'component' => 'Magento_Ui/js/form/components/button',
            'name' => 'buttonSubmit',
            'title' => 'Create Shipment & Label',
            'buttonClasses' => 'primary',
            'actions' => [
                [
                    'targetName' => 'dhl_packaging_popup.dhl_packaging_popup',
                    'actionName' => 'submit',
                ]
            ]
        ];

        return $result;
    }

    /**
     * @return mixed[][]
     */
    private function getNewPackageButton(): array
    {
        $result['components'][] = [
            'component' => 'Magento_Ui/js/form/components/button',
            'name' => 'buttonReset',
            'title' => 'Configure another package',
            'disabled' => true,
            'actions' => [
                [
                    'targetName' => 'dhl_packaging_popup.dhl_packaging_popup',
                    'actionName' => 'setActiveFieldset',
                    'params'     => ['dhl_fieldset_items'],
                ],
                [
                    'targetName' => 'dhl_packaging_popup.dhl_packaging_popup',
                    'actionName' => 'reset',
                ]
            ]
        ];

        return $result;
    }
}
